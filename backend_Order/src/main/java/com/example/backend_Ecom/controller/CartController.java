package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.CartItemRequestDto;
import com.example.backend_Ecom.dto.CartResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.security.UserPrincipal;
import com.example.backend_Ecom.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

@Tag(name = "Cart", description = "Shopping cart operations")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/carts
     * ✅ Authenticated by SecurityConfig + JWT token
     * Lấy giỏ hàng của user, tự động tạo mới nếu chưa có
     */
    @Operation(summary = "Get or create current user's cart")
    @GetMapping
    public ResponseEntity<CartResponseDto> getOrCreateCart(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.getOrCreateCart(principal.getId()));
    }

    /**
     * POST /api/carts/items
     * ✅ Authenticated by SecurityConfig + JWT token
     * Thêm sản phẩm vào giỏ hàng
     */
    @Operation(summary = "Add item to current user's cart")
    @PostMapping("/items")
    public ResponseEntity<CartResponseDto> addItemToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartItemRequestDto request) {
        return ResponseEntity.ok(cartService.addItemToCart(principal.getId(), request));
    }

    /**
     * PATCH /api/carts/items/{cartItemId}?quantity=5
     * ✅ Authenticated by SecurityConfig + JWT token
     * Cập nhật số lượng sản phẩm trong giỏ
     */
    @Operation(summary = "Update cart item quantity")
    @PatchMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponseDto> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Cart Item ID") @PathVariable @Min(value = 1, message = "Cart Item ID must be positive") Long cartItemId,
            @Parameter(description = "New quantity") @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateCartItem(principal.getId(), cartItemId, quantity));
    }

    /**
     * DELETE /api/carts/items/{cartItemId}
     * ✅ Authenticated by SecurityConfig + JWT token
     * Xóa sản phẩm khỏi giỏ hàng
     */
    @Operation(summary = "Remove item from current user's cart")
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponseDto> removeCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Cart Item ID") @PathVariable @Min(value = 1, message = "Cart Item ID must be positive") Long cartItemId) {
        return ResponseEntity.ok(cartService.removeCartItem(principal.getId(), cartItemId));
    }

    /**
     * DELETE /api/carts
     * ✅ Authenticated by SecurityConfig + JWT token
     * Xóa tất cả sản phẩm trong giỏ hàng
     */
    @Operation(summary = "Clear current user's cart")
    @DeleteMapping
    public ResponseEntity<MessageResponseDto> clearCart(
            @AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(new MessageResponseDto(true, "Cart cleared successfully"));
    }
}
