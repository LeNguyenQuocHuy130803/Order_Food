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
     * @Transactional: Nếu order tạo thành công nhưng giảm inventory fail → rollback tất cả
     */
    @Transactional
    public OrderResponseDto createOrderFromCart(Long userId, OrderRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "User not found"));

        // Get cart first to validate it's not empty
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Cart not found or is empty"));

        if (cart.getItems().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Cannot create order from empty cart");
        }

        // 🔥 LẤY ADDRESS TỪ USER'S ADDRESSES LIST
        Address selectedAddress = null;
        
        if (user.getAddresses() == null || user.getAddresses().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Please add address first before checkout");
        }
        // 2️⃣ Nếu có addressType → lấy address theo type
        if (request.getAddressType() != null && !request.getAddressType().isEmpty()) {
            selectedAddress = user.getAddresses().stream()
                    .filter(addr -> addr.getType().name().equalsIgnoreCase(request.getAddressType()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, 
                        "Address type '" + request.getAddressType() + "' not found"));
        }
        // 3️⃣ Nếu không chọn → lấy default (HOME hoặc isDefault=true)
        else {
            selectedAddress = user.getAddresses().stream()
                    .filter(addr -> addr.getIsDefault() != null && addr.getIsDefault())
                    .findFirst()
                    .orElseGet(() -> user.getAddresses().stream()
                            .filter(addr -> addr.getType().name().equalsIgnoreCase("HOME"))
                            .findFirst()
                            .orElse(null));
            
            if (selectedAddress == null) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "No default address found. Please set a default address");
            }
        }

        String addressString = selectedAddress.getType() + " - " + selectedAddress.getAddress();

        // Create order items from cart items
        Order order = Order.builder()
                .user(user)
                .totalPrice(cart.getTotalPrice())
                .status(OrderStatus.PENDING)
                .address(addressString)
                .notes(request.getNotes())
                .build();

        // Create order items
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

        // Validate products still exist and have stock
        for (OrderItem item : orderItems) {
            validateProductAndStock(item.getProductType(), item.getProductId(), item.getQuantity());
        }

        Order savedOrder = orderRepository.save(order);
        log.info("✓ Order created (PENDING): ID={}, User={}, Address={}, Total={} VND", 
            savedOrder.getId(), userId, addressString, savedOrder.getTotalPrice());

        // Decrease inventory for each product (CRITICAL - must succeed for order to complete)
        try {
            for (OrderItem item : orderItems) {
                decreaseProductQuantity(item.getProductType(), item.getProductId(), item.getQuantity());
            }
        } catch (Exception e) {
            log.error("❌ Failed to decrease inventory for Order ID: {}", savedOrder.getId(), e);
            throw new AppException(ErrorCode.INVALID_REQUEST, "Failed to process inventory: " + e.getMessage());
        }

        // Clear cart after successful order & inventory update
        cart.getItems().clear();
        cart.setTotalPrice(java.math.BigDecimal.ZERO);
        cartRepository.save(cart);

        // ⏳ PENDING: Inventory checked & decreased successfully, now waiting for payment
        // Status will change to PAID after PayPal payment executed
        // Then admin/system confirms order → CONFIRMED
        log.info("✓ Order created & waiting for payment: ID={}", savedOrder.getId());

        log.info("✓ Order created successfully for user: {} (Order ID: {})", userId, savedOrder.getId());

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

        // Check if order belongs to user
        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to view this order");
        }

        return mapToDto(order);
    }

    /**
     * Lấy tất cả orders của user (phân trang)
     * Query trực tiếp từ DB với userId filter (không filter trong Java)
     */
    public PaginatedOrderResponseDto getUserOrders(Long userId, int page, int size) {
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "User not found"));

        // Convert 1-based page to 0-based for Spring Data
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
     * Cập nhật status của order
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
     * Hủy order (chỉ khi status không phải DELIVERING hoặc DELIVERED)
     * @Transactional: Nếu hủy thành công nhưng restore inventory fail → rollback
     */
    @Transactional
    public OrderResponseDto cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to cancel this order");
        }

        // 🔥 Chỉ cho phép hủy nếu status < DELIVERING (tức PENDING, CONFIRMED, PREPARING, hoặc READY)
        if (order.getStatus() == OrderStatus.DELIVERING || order.getStatus() == OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                "Cannot cancel order with status: " + order.getStatus() + ". Shipper is already delivering or order delivered.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        // Restore inventory for all order items (CRITICAL)
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
     * Map Order entity to OrderResponseDto
     */
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

    /**
     * Map OrderItem entity to OrderItemResponseDto
     */
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
     * Update order status to PAID after PayPal payment successful
     * Called by PaymentService after executePayment()
     */
    @Transactional
    public OrderResponseDto updateOrderStatusToPaid(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                "Cannot update order status. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.PAID);
        order = orderRepository.save(order);
        log.info("✓ Order status updated to PAID: ID={}", orderId);

        return mapToDto(order);
    }

    /**
     * Confirm order - change from PAID to CONFIRMED
     * Called by admin/system after verifying payment & order readiness
     */
    @Transactional
    public OrderResponseDto confirmOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Order not found"));

        // Only order creator or admin can confirm
        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to confirm this order");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                "Cannot confirm order. Current status: " + order.getStatus() + " (must be PAID)");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order = orderRepository.save(order);
        log.info("✓ Order confirmed: ID={}", orderId);

        return mapToDto(order);
    }

    /**
     * 🚀 Giảm số lượng sản phẩm từ inventory sau khi checkout thành công
     * ✅ OPTIMISTIC UPDATE: Atomic operation at DB level using WHERE condition
     * UPDATE quantity = quantity - :qty WHERE id = :id AND quantity >= :qty
     * 
     * @return: affected rows count (1 = success, 0 = insufficient stock)
     */
    private void decreaseProductQuantity(ProductType productType, Long productId, Integer quantityToPurchase) {
        String productName = null;
        int affectedRows = 0;

        // 🔥 Fetch product name first for logging
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

        // 💥 Critical check: if affected rows = 0 → someone else bought it already (race condition handled!)
        if (affectedRows == 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                "Out of stock for " + productType.toString() + ": " + productName + ". Quantity requested: " + quantityToPurchase);
        }

        log.info("✅ Inventory decreased (OPTIMISTIC): {} '{}' sold: {} (DB atomic update)", 
            productType, productName, quantityToPurchase);
    }

    /**
     * 🚀 Restore số lượng sản phẩm về inventory khi order bị hủy
     * ✅ OPTIMISTIC UPDATE: Atomic operation at DB level
     * UPDATE quantity = quantity + :qty WHERE id = :id
     * (Phục hồi lại nhập kho)
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
            log.info("✅ Inventory restored: {} '{}' quantity += {} (DB atomic update)", 
                productType, productName, quantityToRestore);
        }
    }
}

