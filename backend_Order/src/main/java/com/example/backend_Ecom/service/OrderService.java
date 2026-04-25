package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.OrderRequestDto;
import com.example.backend_Ecom.dto.OrderResponseDto;
import com.example.backend_Ecom.dto.PaginatedOrderResponseDto;
import com.example.backend_Ecom.entity.*;
import com.example.backend_Ecom.enums.OrderStatus;
import com.example.backend_Ecom.enums.ProductType;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserJpaRepository userRepository;
    private final FoodRepository foodRepository;
    private final DrinkRepository drinkRepository;
    private final DessertRepository dessertRepository;
    private final FreshRepository freshRepository;

    /**
     * Tạo order từ giỏ hàng (checkout)
     * ✅ Dùng PESSIMISTIC_WRITE lock để tránh double-submit race condition
     * ✅ Trừ kho ngay khi checkout (hàng được reserve)
     * Nếu thanh toán thất bại → PaymentService gọi cancelOrderBySystem() để hoàn kho
     */
    @Transactional
    public OrderResponseDto createOrderFromCart(Long userId, OrderRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "User not found"));

        // ✅ FIX RACE CONDITION: Dùng PESSIMISTIC lock khi checkout
        // Ngăn 2 request tạo order cùng lúc từ cùng 1 giỏ hàng
        Cart cart = cartRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Cart not found or is empty"));

        if (cart.getItems().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Cannot create order from empty cart");
        }

        // 🔥 LẤY ADDRESS - SUPPORT 2 CÁCH: SAVED ADDRESS HOẶC INLINE ADDRESS
        String addressString = null;

        // 1️⃣ CÁCH 1: Nếu có addressType → lấy từ saved addresses
        if (request.getAddressType() != null && !request.getAddressType().isEmpty()) {
            if (user.getAddresses() == null || user.getAddresses().isEmpty()) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "No saved addresses found. Please add address first");
            }

            Address selectedAddress = user.getAddresses().stream()
                    .filter(addr -> addr.getType().name().equalsIgnoreCase(request.getAddressType()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST,
                        "Address type '" + request.getAddressType() + "' not found in saved addresses"));

            addressString = selectedAddress.getType() + " - " + selectedAddress.getAddress();
        }
        // 2️⃣ CÁCH 2: Nếu không có addressType nhưng có inline address → dùng inline
        else if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            addressString = request.getAddress();
        }
        // 3️⃣ Nếu không cung cấp → lấy default từ saved addresses
        else if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            Address defaultAddress = user.getAddresses().stream()
                    .filter(addr -> addr.getIsDefault() != null && addr.getIsDefault())
                    .findFirst()
                    .orElseGet(() -> user.getAddresses().stream()
                            .filter(addr -> addr.getType().name().equalsIgnoreCase("HOME"))
                            .findFirst()
                            .orElse(null));

            if (defaultAddress != null) {
                addressString = defaultAddress.getType() + " - " + defaultAddress.getAddress();
            }
        }

        // ❌ Nếu vẫn không có address → lỗi
        if (addressString == null || addressString.trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                "No address found. Please provide either addressType or inline address");
        }

        // Tạo Order
        Order order = Order.builder()
                .user(user)
                .totalPrice(cart.getTotalPrice())
                .status(OrderStatus.PENDING)
                .address(addressString)
                .notes(request.getNotes())
                .build();

        // Tạo order items từ cart items
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> OrderItem.builder()
                        .order(order)
                        .productType(cartItem.getProductType())
                        .productId(cartItem.getProductId())
                        .productName(cartItem.getProductName())
                        .imageUrl(cartItem.getImageUrl())
                        .priceAtTime(cartItem.getPriceAtTime())
                        .quantity(cartItem.getQuantity())
                        .build())
                .collect(Collectors.toList());

        order.setItems(orderItems);

        // Validate sản phẩm còn tồn tại và có đủ stock trước khi trừ kho
        for (OrderItem item : orderItems) {
            validateProductAndStock(item.getProductType(), item.getProductId(), item.getQuantity());
        }

        Order savedOrder = orderRepository.save(order);
        log.info("✓ Order created (PENDING): ID={}, User={}, Address={}, Total={} VND",
            savedOrder.getId(), userId, addressString, savedOrder.getTotalPrice());

        // Trừ kho cho từng sản phẩm (reserve hàng cho order)
        // Nếu thanh toán thất bại → PaymentService gọi cancelOrderBySystem() để hoàn kho
        try {
            for (OrderItem item : orderItems) {
                decreaseProductQuantity(item.getProductType(), item.getProductId(), item.getQuantity());
            }
        } catch (Exception e) {
            log.error("❌ Failed to decrease inventory for Order ID: {}", savedOrder.getId(), e);
            throw new AppException(ErrorCode.INVALID_REQUEST, "Failed to process inventory: " + e.getMessage());
        }

        // Xóa giỏ hàng sau khi checkout thành công
        cart.getItems().clear();
        cart.setTotalPrice(java.math.BigDecimal.ZERO);
        cartRepository.save(cart);

        log.info("✓ Order created & inventory reserved. Waiting for payment: ID={}", savedOrder.getId());

        return mapToDto(savedOrder);
    }

    /**
     * Validate sản phẩm còn tồn tại và có đủ stock
     */
    private void validateProductAndStock(ProductType productType, Long productId, Integer requestedQuantity) {
        switch (productType) {
            case FOOD:
                Food food = foodRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food product not found"));
                if (food.getQuantity() < requestedQuantity) {
                    throw new AppException(ErrorCode.INVALID_REQUEST,
                        "Food: " + food.getName() + " - Not enough stock. Available: " + food.getQuantity());
                }
                break;

            case DRINK:
                Drink drink = drinkRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Drink product not found"));
                if (drink.getQuantity() < requestedQuantity) {
                    throw new AppException(ErrorCode.INVALID_REQUEST,
                        "Drink: " + drink.getName() + " - Not enough stock. Available: " + drink.getQuantity());
                }
                break;

            case DESSERT:
                Dessert dessert = dessertRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert product not found"));
                if (dessert.getQuantity() < requestedQuantity) {
                    throw new AppException(ErrorCode.INVALID_REQUEST,
                        "Dessert: " + dessert.getName() + " - Not enough stock. Available: " + dessert.getQuantity());
                }
                break;

            case FRESH:
                Fresh fresh = freshRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));
                if (fresh.getQuantity() < requestedQuantity) {
                    throw new AppException(ErrorCode.INVALID_REQUEST,
                        "Fresh: " + fresh.getName() + " - Not enough stock. Available: " + fresh.getQuantity());
                }
                break;

            default:
                throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid product type");
        }
    }

    /**
     * Lấy order theo ID
     */
    public OrderResponseDto getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to view this order");
        }

        return mapToDto(order);
    }

    /**
     * Lấy tất cả orders của user (phân trang)
     */
    public PaginatedOrderResponseDto getUserOrders(Long userId, int page, int size) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "User not found"));

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);

        List<OrderResponseDto> orderDtos = orderPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PaginatedOrderResponseDto.builder()
                .data(orderDtos)
                .pageNumber(orderPage.getNumber() + 1)
                .pageSize(orderPage.getSize())
                .totalRecords(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    /**
     * Lấy tất cả orders (admin)
     */
    public PaginatedOrderResponseDto getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Order> orderPage = orderRepository.findAll(pageable);

        List<OrderResponseDto> orderDtos = orderPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PaginatedOrderResponseDto.builder()
                .data(orderDtos)
                .pageNumber(orderPage.getNumber() + 1)
                .pageSize(orderPage.getSize())
                .totalRecords(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    /**
     * Cập nhật status của order (admin)
     */
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Order not found"));

        order.setStatus(newStatus);
        order = orderRepository.save(order);
        log.info("✓ Order status updated: {} -> {}", orderId, newStatus);

        return mapToDto(order);
    }

    /**
     * Hủy order bởi user (chỉ khi chưa DELIVERING hoặc DELIVERED)
     * Hoàn kho sau khi hủy
     */
    @Transactional
    public OrderResponseDto cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to cancel this order");
        }

        if (order.getStatus() == OrderStatus.DELIVERING || order.getStatus() == OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                "Cannot cancel order with status: " + order.getStatus() + ". Shipper is already delivering or order delivered.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        // Hoàn kho
        try {
            for (OrderItem item : order.getItems()) {
                restoreProductQuantity(item.getProductType(), item.getProductId(), item.getQuantity());
            }
        } catch (Exception e) {
            log.error("❌ Failed to restore inventory for cancelled Order ID: {}", orderId, e);
            throw new AppException(ErrorCode.INVALID_REQUEST, "Failed to restore inventory: " + e.getMessage());
        }

        log.info("✓ Order cancelled and inventory restored: {} by user: {}", orderId, userId);

        return mapToDto(order);
    }

    /**
     * ✅ Update order status to PAID — gọi bởi PaymentService sau khi capture thành công
     * Idempotent: nếu order đã PAID rồi thì không throw, trả về kết quả bình thường
     */
    @Transactional
    public OrderResponseDto updateOrderStatusToPaid(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Order not found"));

        // Idempotent: nếu đã PAID rồi thì không làm gì thêm (tránh lỗi khi PayPal retry)
        if (order.getStatus() == OrderStatus.PAID) {
            log.info("ℹ️ Order {} already PAID — skipping (idempotent)", orderId);
            return mapToDto(order);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                "Cannot mark as PAID. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.PAID);
        order = orderRepository.save(order);
        log.info("✓ Order status updated to PAID: ID={}", orderId);

        return mapToDto(order);
    }

    /**
     * ✅ Hủy order bởi system (khi thanh toán thất bại) — không check userId
     * Hoàn kho sau khi hủy
     */
    @Transactional
    public void cancelOrderBySystem(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("⚠️ cancelOrderBySystem: Order {} not found", orderId);
            return;
        }

        // Chỉ hủy nếu đang PENDING (thanh toán chưa hoàn tất)
        if (order.getStatus() != OrderStatus.PENDING) {
            log.info("ℹ️ cancelOrderBySystem: Order {} is already {} — skip cancel", orderId, order.getStatus());
            return;
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Hoàn kho
        for (OrderItem item : order.getItems()) {
            try {
                restoreProductQuantity(item.getProductType(), item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                log.error("❌ Failed to restore inventory for item {} in Order {}", item.getId(), orderId, e);
            }
        }

        log.info("✅ Order {} cancelled by system (payment failed) — inventory restored", orderId);
    }

    /**
     * Confirm order — chuyển PAID → CONFIRMED bởi user/admin
     * ✅ FIX: Nếu scheduler đã tự CONFIRMED rồi thì không lỗi, trả kết quả bình thường
     */
    @Transactional
    public OrderResponseDto confirmOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to confirm this order");
        }

        // Idempotent: nếu scheduler đã CONFIRMED rồi → bình thường trả về
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            log.info("ℹ️ Order {} already CONFIRMED — returning current state", orderId);
            return mapToDto(order);
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                "Cannot confirm order. Current status: " + order.getStatus() + " (must be PAID or CONFIRMED)");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order = orderRepository.save(order);
        log.info("✓ Order confirmed: ID={}", orderId);

        return mapToDto(order);
    }

    // ========================= PRIVATE HELPERS =========================

    private OrderResponseDto mapToDto(Order order) {
        List<com.example.backend_Ecom.dto.OrderItemResponseDto> items = order.getItems().stream()
                .map(this::mapItemToDto)
                .collect(Collectors.toList());

        return OrderResponseDto.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .address(order.getAddress())
                .notes(order.getNotes())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private com.example.backend_Ecom.dto.OrderItemResponseDto mapItemToDto(OrderItem item) {
        return com.example.backend_Ecom.dto.OrderItemResponseDto.builder()
                .id(item.getId())
                .productType(item.getProductType())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .imageUrl(item.getImageUrl())
                .priceAtTime(item.getPriceAtTime())
                .quantity(item.getQuantity())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    /**
     * Giảm số lượng sản phẩm từ inventory (atomic DB update)
     */
    private void decreaseProductQuantity(ProductType productType, Long productId, Integer quantityToPurchase) {
        String productName = null;
        int affectedRows = 0;

        switch (productType) {
            case FOOD:
                Food food = foodRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food product not found"));
                productName = food.getName();
                affectedRows = foodRepository.decreaseStockIfAvailable(productId, quantityToPurchase);
                break;

            case DRINK:
                Drink drink = drinkRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Drink product not found"));
                productName = drink.getName();
                affectedRows = drinkRepository.decreaseStockIfAvailable(productId, quantityToPurchase);
                break;

            case DESSERT:
                Dessert dessert = dessertRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert product not found"));
                productName = dessert.getName();
                affectedRows = dessertRepository.decreaseStockIfAvailable(productId, quantityToPurchase);
                break;

            case FRESH:
                Fresh fresh = freshRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));
                productName = fresh.getName();
                affectedRows = freshRepository.decreaseStockIfAvailable(productId, quantityToPurchase);
                break;

            default:
                throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid product type: " + productType);
        }

        if (affectedRows == 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                "Out of stock for " + productType + ": " + productName + ". Requested: " + quantityToPurchase);
        }

        log.info("✅ Inventory decreased: {} '{}' sold: {}", productType, productName, quantityToPurchase);
    }

    /**
     * Hoàn số lượng sản phẩm về inventory khi order bị hủy (atomic DB update)
     */
    private void restoreProductQuantity(ProductType productType, Long productId, Integer quantityToRestore) {
        String productName = null;
        int affectedRows = 0;

        switch (productType) {
            case FOOD:
                Food food = foodRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food product not found"));
                productName = food.getName();
                affectedRows = foodRepository.increaseStock(productId, quantityToRestore);
                break;

            case DRINK:
                Drink drink = drinkRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Drink product not found"));
                productName = drink.getName();
                affectedRows = drinkRepository.increaseStock(productId, quantityToRestore);
                break;

            case DESSERT:
                Dessert dessert = dessertRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert product not found"));
                productName = dessert.getName();
                affectedRows = dessertRepository.increaseStock(productId, quantityToRestore);
                break;

            case FRESH:
                Fresh fresh = freshRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));
                productName = fresh.getName();
                affectedRows = freshRepository.increaseStock(productId, quantityToRestore);
                break;

            default:
                throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid product type: " + productType);
        }

        if (affectedRows > 0) {
            log.info("✅ Inventory restored: {} '{}' quantity += {}", productType, productName, quantityToRestore);
        }
    }
}
