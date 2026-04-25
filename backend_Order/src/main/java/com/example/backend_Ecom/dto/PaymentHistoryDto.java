package com.example.backend_Ecom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryDto {

    private Long id;

    private String txnRef; // Mã giao dịch (PayPal OrderId)

    private Long amount; // Số tiền VND

    private String status; // PENDING, SUCCESS, FAILED

    private String provider; // PAYPAL, VNPAY

    private String responseCode; // PayPal status hoặc vnp_ResponseCode

    private String orderInfo; // Thông tin đơn hàng (Order X)

    private String paypalOrderId;

    private String payerId;

    private String captureId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ===== HELPER FIELDS =====
    private String statusVN; // Status in Vietnamese (CHỜ_XỬ_LÝ, THÀNH_CÔNG, THẤT_BẠI)

    private String amountFormatted; // Amount formatted: "250,000 VND"
}
