package com.example.backend_Ecom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String txnRef; // Mã giao dịch (PayPal OrderId)

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long amount; // Số tiền (VND)

    @Column(nullable = false, length = 20)
    private String status; // PENDING, SUCCESS, FAILED

    @Column(length = 50)
    private String provider; // PAYPAL

    @Column(length = 50)
    private String responseCode; // PayPal status (COMPLETED, FAILED, PENDING, etc.)

    @Column(length = 500)
    private String orderInfo; // Thông tin đơn hàng

    @Column(columnDefinition = "TEXT")
    private String paypalData; // JSON data từ PayPal

    // ===== PAYPAL SPECIFIC FIELDS =====
    @Column(length = 100)
    private String paypalOrderId; // PayPal order ID

    @Column(length = 100)
    private String payerId; // PayPal payer ID

    @Column(length = 100)
    private String captureId; // PayPal capture transaction ID

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}