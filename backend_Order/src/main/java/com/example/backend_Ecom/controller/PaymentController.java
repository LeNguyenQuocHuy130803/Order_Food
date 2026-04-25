package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.PaymentRequestDto;
import com.example.backend_Ecom.dto.PaymentHistoryDto;
import com.example.backend_Ecom.security.UserPrincipal;
import com.example.backend_Ecom.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // ================== CREATE PAYMENT ==================
    @PostMapping("/paypal/create-payment")
    public ResponseEntity<?> createPaypalOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequestDto request) {

        return ResponseEntity.ok(
                paymentService.createPaypalOrder(principal.getId(), request)
        );
    }

    // ================== CAPTURE PAYMENT ==================
    /**
     * 🔐 SECURITY: Không accept orderId từ request
     * 👉 Chỉ dùng custom_id từ PayPal (an toàn hơn)
     */
    @GetMapping("/paypal/confirm")
    public ResponseEntity<?> capturePaypalOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String paypalOrderId) {

        return ResponseEntity.ok(
                paymentService.capturePaypalOrder(principal.getId(), paypalOrderId)
        );
    }

    // ================== PAYMENT HISTORY ==================
    /**
     * 📋 GET /api/payments/history
     * Lấy lịch sử thanh toán của user (sắp xếp mới nhất trước)
     */
    @GetMapping("/history")
    public ResponseEntity<List<PaymentHistoryDto>> getPaymentHistory(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<PaymentHistoryDto> history = paymentService.getPaymentHistory(principal.getId());
        return ResponseEntity.ok(history);
    }

    /**
     * 📋 GET /api/payments/history/{txnRef}
     * Lấy chi tiết 1 transaction
     */
    @GetMapping("/history/{txnRef}")
    public ResponseEntity<?> getPaymentDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String txnRef) {

        return paymentService.getPaymentDetail(principal.getId(), txnRef)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}