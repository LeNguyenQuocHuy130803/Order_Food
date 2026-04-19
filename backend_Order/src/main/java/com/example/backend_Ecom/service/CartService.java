package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.CartItemRequestDto;
import com.example.backend_Ecom.dto.CartItemResponseDto;
import com.example.backend_Ecom.dto.CartResponseDto;
import com.example.backend_Ecom.entity.*;
import com.example.backend_Ecom.enums.ProductType;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final FoodRepository foodRepository;
    private final DrinkRepository drinkRepository;
    private final DessertRepository dessertRepository;
    private final FreshRepository freshRepository;
    private final UserJpaRepository userRepository;

    /**
     * Lấy cart của user, nếu không có thì tạo mới
     * TỰ ĐỘNG CHỮA LÀNH GIỎ HÀNG: 
     * 1. Cập nhật lại giá tiền mới nhất từ Admin (Fix Bug 2)
     * 2. Xoá bỏ các món hàng mà Admin đã gỡ khỏi hệ thống (Fix Bug 1)
     */
    public CartResponseDto getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .totalPrice(java.math.BigDecimal.ZERO)
                            .build();
                    return cartRepository.save(newCart);
                });

        boolean isModified = false;
        List<CartItem> itemsToRemove = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            try {
                // Thử kéo dữ liệu thật từ DB lên (Lấy Name và Price mới nhất)
                ProductInfo freshInfo = getProductInfo(item.getProductType(), item.getProductId());
                
                // Cập nhật nếu Admin mới đổi Giá hoặc Tên món
                if (!item.getPriceAtTime().equals(freshInfo.getPrice()) || 
                    !item.getProductName().equals(freshInfo.getName())) {
                    item.setPriceAtTime(freshInfo.getPrice());
                    item.setProductName(freshInfo.getName());
                    isModified = true;
                }
            } catch (AppException e) {
                // Rớt vào đây tức là FoodType + FoodId này không tốn tại nữa (Admin đã xoá)
                // -> Chuẩn bị xoá khỏi giỏ
                itemsToRemove.add(item);
                log.warn("Auto-healing Cart: Removed stale product {} (ID: {}) from user {}'s cart", 
                    item.getProductType(), item.getProductId(), userId);
            }
        }

        // Thi hành gỡ các món hàng ma
        if (!itemsToRemove.isEmpty()) {
            cart.getItems().removeAll(itemsToRemove);
            isModified = true;
        }

        // Lưu lại nếu có thay đổi trong ruột giỏ hàng (giá thay đổi hoặc mất món)
        if (isModified) {
            recalculateCartTotal(cart);
            cart = cartRepository.save(cart);
        }
        
        // Ensure cart total is calculated even if empty
        if (cart.getTotalPrice() == null) {
            cart.setTotalPrice(java.math.BigDecimal.ZERO);
        }

        return mapToDto(cart);
    }

    /**
     * Lấy chi tiết product (name + price + imageUrl) từ các repositories khác nhau
     */
    private ProductInfo getProductInfo(ProductType productType, Long productId) {
        switch (productType) {
            case FOOD:
                Food food = foodRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food not found"));
                return new ProductInfo(food.getName(), food.getPrice(), food.getQuantity(), food.getImageUrl());

            case DRINK:
                Drink drink = drinkRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Drink not found"));
                return new ProductInfo(drink.getName(), drink.getPrice(), drink.getQuantity(), drink.getImageUrl());

            case DESSERT:
                Dessert dessert = dessertRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert not found"));
                return new ProductInfo(dessert.getName(), dessert.getPrice(), dessert.getQuantity(), dessert.getImageUrl());

            case FRESH:
                Fresh fresh = freshRepository.findById(productId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));
                return new ProductInfo(fresh.getName(), fresh.getPrice(), fresh.getQuantity(), fresh.getImageUrl());

            default:
                throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid product type");
        }
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    public CartResponseDto addItemToCart(Long userId, CartItemRequestDto request) {
        // Validate quantity
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "User not found"));
                    Cart newCart = Cart.builder()
                            .user(user)
                            .totalPrice(java.math.BigDecimal.ZERO)
                            .build();
                    return cartRepository.save(newCart);
                });

        // Get product info
        ProductInfo productInfo = getProductInfo(request.getProductType(), request.getProductId());

        // Check if product still has stock
        if (productInfo.getQuantity() < request.getQuantity()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                "Not enough stock. Available: " + productInfo.getQuantity());
        }

        // Check if item already in cart - if yes, update quantity
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductType() == request.getProductType() && 
                               item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // Update quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (productInfo.getQuantity() < newQuantity) {
                throw new AppException(ErrorCode.INVALID_REQUEST, 
                    "Not enough stock. Available: " + productInfo.getQuantity());
            }
            existingItem.setQuantity(newQuantity);
        } else {
            // Create new cart item
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productType(request.getProductType())
                    .productId(request.getProductId())
                    .productName(productInfo.getName())
                    .imageUrl(productInfo.getImageUrl())
                    .priceAtTime(productInfo.getPrice())
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        // Recalculate total price
        recalculateCartTotal(cart);

        cart = cartRepository.save(cart);
        log.info("✓ Item added to cart for user: {}", userId);

        return mapToDto(cart);
    }

    /**
     * Update số lượng sản phẩm trong giỏ
     */
    public CartResponseDto updateCartItem(Long userId, Long cartItemId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Cart not found"));

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Cart item not found"));

        // Check stock
        ProductInfo productInfo = getProductInfo(cartItem.getProductType(), cartItem.getProductId());
        if (productInfo.getQuantity() < quantity) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                "Not enough stock. Available: " + productInfo.getQuantity());
        }

        cartItem.setQuantity(quantity);
        recalculateCartTotal(cart);

        cart = cartRepository.save(cart);
        log.info("✓ Cart item updated for user: {}", userId);

        return mapToDto(cart);
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     */
    public CartResponseDto removeCartItem(Long userId, Long cartItemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Cart not found"));

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Cart item not found"));

        cart.getItems().remove(cartItem);
        recalculateCartTotal(cart);

        cart = cartRepository.save(cart);
        log.info("✓ Cart item removed for user: {}", userId);

        return mapToDto(cart);
    }

    /**
     * Xóa tất cả sản phẩm trong giỏ hàng
     */
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Cart not found"));

        cart.getItems().clear();
        cart.setTotalPrice(java.math.BigDecimal.ZERO);

        cartRepository.save(cart);
        log.info("✓ Cart cleared for user: {}", userId);
    }

    /**
     * Tính lại tổng giá của giỏ hàng
     */
    private void recalculateCartTotal(Cart cart) {
        java.math.BigDecimal totalPrice = cart.getItems().stream()
                .map(item -> item.getPriceAtTime().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        cart.setTotalPrice(totalPrice);
    }

    /**
     * Map Cart entity to CartResponseDto
     */
    private CartResponseDto mapToDto(Cart cart) {
        List<CartItemResponseDto> items = cart.getItems().stream()
                .map(this::mapItemToDto)
                .collect(Collectors.toList());

        return CartResponseDto.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .totalPrice(cart.getTotalPrice())
                .items(items)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    /**
     * Map CartItem entity to CartItemResponseDto
     */
    private CartItemResponseDto mapItemToDto(CartItem item) {
        return CartItemResponseDto.builder()
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
     * Helper class to store product info (name, price, quantity, imageUrl)
     */
    private static class ProductInfo {
        private final String name;
        private final java.math.BigDecimal price;
        private final Integer quantity;
        private final String imageUrl;

        public ProductInfo(String name, java.math.BigDecimal price, Integer quantity, String imageUrl) {
            this.name = name;
            this.price = price;
            this.quantity = quantity;
            this.imageUrl = imageUrl;
        }

        public String getName() {
            return name;
        }

        public java.math.BigDecimal getPrice() {
            return price;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public String getImageUrl() {
            return imageUrl;
        }
    }
}
