package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.dto.OrderRequestDto;
import com.example.backend_Ecom.dto.OrderResponseDto;
import com.example.backend_Ecom.dto.PaginatedOrderResponseDto;
import com.example.backend_Ecom.enums.OrderStatus;
import com.example.backend_Ecom.security.UserPrincipal;
import com.example.backend_Ecom.service.OrderService;
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
import jakarta.validation.constraints.Max;

@Tag(name = "Order", description = "Order management operations")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders/checkout
     * ✅ Authenticated by SecurityConfig + JWT token
     * Tạo order từ giỏ hàng (checkout)
     */
    @Operation(summary = "Create order from cart (checkout)")
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponseDto> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderRequestDto request) {
        return ResponseEntity.ok(orderService.createOrderFromCart(principal.getId(), request));
    }

    /**
     * GET /api/orders/{orderId}
     * ✅ Authenticated by SecurityConfig + JWT token
     * Lấy chi tiết order
     */
    @Operation(summary = "Get order details")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrderById(
            @Parameter(description = "Order ID") @PathVariable @Min(value = 1, message = "Order ID must be positive") Long orderId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.getOrderById(orderId, principal.getId()));
    }

    /**
     * GET /api/orders/paging?page=1&size=10
     * ✅ Authenticated by SecurityConfig + JWT token
     * Lấy tất cả orders của user hiện tại (phân trang)
     */
    @Operation(summary = "Get current user's orders with pagination")
    @GetMapping("/paging")
    public ResponseEntity<PaginatedOrderResponseDto> getUserOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Page number (1-based)", example = "1") 
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Page must be >= 1") int page,
            @Parameter(description = "Number of items per page", example = "10") 
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Size must be >= 1") @Max(value = 100, message = "Size must be <= 100") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(principal.getId(), page, size));
    }

    /**
     * GET /api/orders/admin/paging?page=1&size=10
     * Lấy tất cả orders (admin only)
     */
    @Operation(summary = "Get all orders with pagination (admin only)")
    @PreAuthorize("hasAuthority('ROLE_Administrators')")
    @GetMapping("/admin/paging")
    public ResponseEntity<PaginatedOrderResponseDto> getAllOrders(
            @Parameter(description = "Page number (1-based)", example = "1") 
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "Page must be >= 1") int page,
            @Parameter(description = "Number of items per page", example = "10") 
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Size must be >= 1") @Max(value = 100, message = "Size must be <= 100") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    /**
     * PATCH /api/orders/{orderId}/status
     * Cập nhật status của order (admin)
     * Query param: status=CONFIRMED
     */
    @Operation(summary = "Update order status (admin)")
    @PreAuthorize("hasAuthority('ROLE_Administrators')")
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @Parameter(description = "Order ID") @PathVariable @Min(value = 1, message = "Order ID must be positive") Long orderId,
            @Parameter(description = "New order status") @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    /**
     * DELETE /api/orders/{orderId}
     * ✅ Authenticated by SecurityConfig + JWT token
     * Hủy order (chỉ khi status không phải DELIVERING hoặc DELIVERED)
     */
    @Operation(summary = "Cancel order")
    @DeleteMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            @Parameter(description = "Order ID") @PathVariable @Min(value = 1, message = "Order ID must be positive") Long orderId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, principal.getId()));
    }
}
