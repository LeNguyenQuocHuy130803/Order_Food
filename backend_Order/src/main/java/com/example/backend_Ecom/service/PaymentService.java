package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.PaymentRequestDto;
import com.example.backend_Ecom.dto.PaymentHistoryDto;
import com.example.backend_Ecom.entity.PaymentTransaction;
import com.example.backend_Ecom.repository.PaymentTransactionRepository;
import com.example.backend_Ecom.repository.OrderRepository;
import com.example.backend_Ecom.security.PaymentConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.Base64;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final PaymentConfig config;
    private final OrderService orderService;

    // ✅ FIX: Inject RestTemplate @Bean (có timeout) thay vì new RestTemplate() mỗi lần
    private final RestTemplate paypalRestTemplate;

    // ================= CREATE PAYMENT =================
    public Map<String, Object> createPaypalOrder(Long userId, PaymentRequestDto request) {

        try {
            Long orderId = request.getOrderId();

            var orderDto = orderService.getOrderById(orderId, userId);
            double amountVND = orderDto.getTotalPrice().doubleValue();

            double amountUSD = convertVNDtoUSD(amountVND);

            String accessToken = getAccessToken();

            String customId = buildCustomId(userId, orderId, amountVND);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> purchaseUnit = new HashMap<>();
            purchaseUnit.put("amount", Map.of(
                    "currency_code", "USD",
                    "value", String.format(Locale.US, "%.2f", amountUSD)
            ));
            purchaseUnit.put("description", "Payment for Order " + orderId);
            purchaseUnit.put("custom_id", customId);

            // ✅ FIX: cancel_url dùng config.getPaypalCancelUrl() riêng, không lẫn với return_url
            Map<String, Object> orderBody = Map.of(
                    "intent", "CAPTURE",
                    "purchase_units", List.of(purchaseUnit),
                    "application_context", Map.of(
                            "return_url", request.getReturnUrl() != null
                                    ? request.getReturnUrl()
                                    : config.getPaypalReturnUrl(),

                            "cancel_url", request.getCancelUrl() != null
                                    ? request.getCancelUrl()
                                    : config.getPaypalCancelUrl()
                    )
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(orderBody, headers);

            ResponseEntity<Map> response = paypalRestTemplate.postForEntity(
                    config.getPaypalApi() + "/v2/checkout/orders",
                    requestEntity,
                    Map.class
            );

            String paypalOrderId = response.getBody().get("id").toString();

            // Check duplicate: tránh tạo 2 transaction cùng PayPal ID
            if (paymentTransactionRepository.existsByTxnRef(paypalOrderId)) {
                log.error("❌ Transaction already exists for PayPalOrderId: {}", paypalOrderId);
                throw new RuntimeException("Transaction already exists for this PayPal Order ID!");
            }

            PaymentTransaction txn = PaymentTransaction.builder()
                    .txnRef(paypalOrderId)
                    .userId(userId)
                    .amount((long) amountVND)
                    .status("PENDING")
                    .provider("PAYPAL")
                    .paypalOrderId(paypalOrderId)
                    .orderInfo("Order " + orderId)
                    .build();

            paymentTransactionRepository.save(txn);
            log.info("✅ Transaction PENDING — PayPalOrderId: {} for user: {}", paypalOrderId, userId);

            List<Map<String, String>> links = (List<Map<String, String>>) response.getBody().get("links");

            String approveUrl = links.stream()
                    .filter(link -> "approve".equals(link.get("rel")))
                    .findFirst()
                    .map(link -> link.get("href"))
                    .orElse(null);

            return Map.of(
                    "success", true,
                    "paypalOrderId", paypalOrderId,
                    "approveUrl", approveUrl,
                    "amountVND", amountVND,
                    "amountUSD", amountUSD,
                    "orderId", orderId
            );

        } catch (Exception e) {
            log.error("❌ PayPal create error", e);
            throw new RuntimeException(e.getMessage());
        }
    }

    // ================= CAPTURE PAYMENT =================
    /**
     * 🔐 IDEMPOTENT CAPTURE - PayPal Order Capture với đầy đủ xử lý edge cases
     *
     * ✅ FIX 1: Idempotent — gọi nhiều lần không lỗi (check DB trước)
     * ✅ FIX 2: Handle 422 ORDER_ALREADY_CAPTURED gracefully (treat as success)
     * ✅ FIX 3: Transactional — đảm bảo data consistency
     * ✅ FIX 4: Fallback — extract orderId từ DB nếu PayPal response fail
     * ✅ FIX 5: Security — verify order ownership, lấy orderId từ PayPal custom_id
     */
    @Transactional
    public Map<String, Object> capturePaypalOrder(Long userId, String paypalOrderId) {
        log.info("🔄 [START] Capturing PayPal order {} for user {}", paypalOrderId, userId);

        try {
            // ============ STEP 1: Check DB Idempotency ============
            Optional<PaymentTransaction> existingTxn = paymentTransactionRepository.findByTxnRef(paypalOrderId);
            
            // Nếu đã SUCCESS trong DB → return success luôn (IDEMPOTENT)
            if (existingTxn.isPresent() && "SUCCESS".equals(existingTxn.get().getStatus())) {
                log.info("✅ [IDEMPOTENT] Transaction {} already SUCCESS in DB. Returning cached result.", paypalOrderId);
                
                Long orderId = extractOrderIdFromTransactionInfo(existingTxn.get());
                return buildCaptureSuccessResponse(true, "COMPLETED", orderId, paypalOrderId, "Idempotent — already captured");
            }

            // ============ STEP 2: Attempt PayPal Capture ============
            String accessToken = getAccessToken();
            Map<String, Object> paypalData = attemptPayPalCapture(paypalOrderId, accessToken);
            
            String paypalStatus = extractPayPalStatus(paypalData);
            Long orderId = extractOrderIdFromPaypal(paypalData);

            // ============ STEP 3: Fallback — Extract orderId từ DB nếu PayPal fail ============
            if (orderId == null && existingTxn.isPresent()) {
                log.warn("⚠️ Could not extract orderId from PayPal response, falling back to DB");
                orderId = extractOrderIdFromTransactionInfo(existingTxn.get());
            }

            if (orderId == null) {
                log.error("❌ [FATAL] Cannot determine orderId from PayPal or DB — PayPalOrderId: {}", paypalOrderId);
                throw new RuntimeException("Invalid PayPal order - missing order ID");
            }

            // ============ STEP 4: Security Verification ============
            final Long finalOrderId = orderId; // Cần final cho lambda
            orderRepository.findByIdAndUserId(finalOrderId, userId)
                    .orElseThrow(() -> {
                        log.error("❌ [SECURITY] userId {} tried to capture order {} that doesn't belong to them", userId, finalOrderId);
                        return new RuntimeException("Order not found or access denied");
                    });

            log.info("✅ [VERIFIED] userId={}, orderId={}, paypalStatus={}", userId, orderId, paypalStatus);

            // ============ STEP 5: Update Transaction in DB ============
            updatePaymentTransaction(existingTxn, paypalOrderId, paypalStatus, paypalData, orderId);

            // ============ STEP 6: Update Order Status ============
            if ("COMPLETED".equals(paypalStatus)) {
                orderService.updateOrderStatusToPaid(orderId);
                log.info("✅ [SUCCESS] Order {} marked as PAID", orderId);
            } else {
                log.warn("⚠️ [FAILED] PayPal status is not COMPLETED: {} — cancelling order {} and restoring inventory", paypalStatus, orderId);
                orderService.cancelOrderBySystem(orderId);
            }

            log.info("✅ [COMPLETE] Capture success for paypalOrderId={}, orderId={}", paypalOrderId, orderId);
            return buildCaptureSuccessResponse("COMPLETED".equals(paypalStatus), paypalStatus, orderId, paypalOrderId, "Capture completed");

        } catch (Exception e) {
            log.error("❌ [ERROR] PayPal capture failed for paypalOrderId={}, userId={}", paypalOrderId, userId, e);
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Attempt capture từ PayPal API — handle 422 gracefully
     */
    private Map<String, Object> attemptPayPalCapture(String paypalOrderId, String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<?> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = paypalRestTemplate.postForEntity(
                    config.getPaypalApi() + "/v2/checkout/orders/" + paypalOrderId + "/capture",
                    request,
                    Map.class
            );

            return response.getBody();

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("❌ PayPal API error: {} — {}", e.getStatusCode(), responseBody);

            // ✅ IDEMPOTENT: Nếu PayPal báo đã capture rồi → treat như success (return COMPLETED status)
            if (e.getStatusCode().value() == 422 && responseBody.contains("ORDER_ALREADY_CAPTURED")) {
                log.warn("⚠️ [IDEMPOTENT] PayPal says order already captured — treating as success");
                
                // Return mock response with COMPLETED status để xử lý như bình thường
                return Map.of(
                        "status", "COMPLETED",
                        "id", paypalOrderId,
                        "purchase_units", List.of(Map.of("custom_id", "unknown"))
                );
            }

            throw new RuntimeException("Payment capture failed: " + e.getMessage());
        }
    }

    /**
     * Extract PayPal status từ response
     */
    private String extractPayPalStatus(Map<String, Object> paypalData) {
        return paypalData != null && paypalData.get("status") != null
                ? paypalData.get("status").toString()
                : "UNKNOWN";
    }

    /**
     * Extract orderId từ transaction orderInfo
     */
    private Long extractOrderIdFromTransactionInfo(PaymentTransaction txn) {
        try {
            String orderInfo = txn.getOrderInfo(); // "Order {id}"
            if (orderInfo != null && orderInfo.startsWith("Order ")) {
                return Long.parseLong(orderInfo.replace("Order ", ""));
            }
        } catch (Exception e) {
            log.warn("⚠️ Failed to parse orderId from transaction orderInfo", e);
        }
        return null;
    }

    /**
     * Update PaymentTransaction sau khi capture
     */
    private void updatePaymentTransaction(Optional<PaymentTransaction> optionalTxn, String paypalOrderId, 
                                         String paypalStatus, Map<String, Object> paypalData, Long orderId) {
        if (!optionalTxn.isPresent()) {
            log.warn("⚠️ Transaction not found in DB for paypalOrderId: {} (direct API call?)", paypalOrderId);
            return;
        }

        PaymentTransaction txn = optionalTxn.get();
        
        // Update status
        String transactionStatus = "COMPLETED".equals(paypalStatus) ? "SUCCESS" : "FAILED";
        txn.setStatus(transactionStatus);
        txn.setResponseCode(paypalStatus);
        txn.setPaypalData(paypalData.toString());

        // Extract Payer ID
        if (paypalData.get("payer") instanceof Map) {
            Map<String, Object> payer = (Map<String, Object>) paypalData.get("payer");
            if (payer.get("payer_id") != null) {
                txn.setPayerId(payer.get("payer_id").toString());
            }
        }

        // Extract Capture ID
        if (paypalData.get("purchase_units") instanceof List) {
            List<Map<String, Object>> units = (List<Map<String, Object>>) paypalData.get("purchase_units");
            if (!units.isEmpty() && units.get(0).get("payments") instanceof Map) {
                Map<String, Object> payments = (Map<String, Object>) units.get(0).get("payments");
                if (payments.get("captures") instanceof List) {
                    List<Map<String, Object>> captures = (List<Map<String, Object>>) payments.get("captures");
                    if (!captures.isEmpty() && captures.get(0).get("id") != null) {
                        txn.setCaptureId(captures.get(0).get("id").toString());
                    }
                }
            }
        }

        paymentTransactionRepository.save(txn);
        log.info("✅ Transaction {} updated: status={}", paypalOrderId, transactionStatus);
    }

    /**
     * Build standard success response
     */
    private Map<String, Object> buildCaptureSuccessResponse(boolean success, String paypalStatus, 
                                                           Long orderId, String paypalOrderId, String message) {
        return Map.of(
                "success", success,
                "paypalStatus", paypalStatus,
                "orderId", orderId != null ? orderId : 0L,
                "paypalOrderId", paypalOrderId,
                "message", message,
                "timestamp", java.time.LocalDateTime.now()
        );
    }

    // ================= PAYMENT HISTORY =================

    /**
     * Lấy lịch sử thanh toán của user (mới nhất trước)
     */
    public List<PaymentHistoryDto> getPaymentHistory(Long userId) {
        List<PaymentTransaction> transactions = paymentTransactionRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        return transactions.stream()
                .map(this::mapToHistoryDto)
                .toList();
    }

    /**
     * Lấy chi tiết 1 transaction — chỉ user chủ sở hữu mới xem được
     */
    public Optional<PaymentHistoryDto> getPaymentDetail(Long userId, String txnRef) {
        Optional<PaymentTransaction> txn = paymentTransactionRepository.findByTxnRef(txnRef);

        if (txn.isPresent() && txn.get().getUserId().equals(userId)) {
            return Optional.of(mapToHistoryDto(txn.get()));
        }

        return Optional.empty();
    }

    // ================= PRIVATE HELPERS =================

    private PaymentHistoryDto mapToHistoryDto(PaymentTransaction txn) {
        String statusVN = switch (txn.getStatus()) {
            case "PENDING" -> "CHỜ XỬ LÝ";
            case "SUCCESS" -> "THÀNH CÔNG";
            case "FAILED"  -> "THẤT BẠI";
            default        -> txn.getStatus();
        };

        String amountFormatted = String.format("%,d VND", txn.getAmount());

        return PaymentHistoryDto.builder()
                .id(txn.getId())
                .txnRef(txn.getTxnRef())
                .amount(txn.getAmount())
                .status(txn.getStatus())
                .statusVN(statusVN)
                .amountFormatted(amountFormatted)
                .provider(txn.getProvider())
                .responseCode(txn.getResponseCode())
                .orderInfo(txn.getOrderInfo())
                .paypalOrderId(txn.getPaypalOrderId())
                .payerId(txn.getPayerId())
                .captureId(txn.getCaptureId())
                .createdAt(txn.getCreatedAt())
                .updatedAt(txn.getUpdatedAt())
                .build();
    }

    /**
     * Lấy PayPal Access Token dùng RestTemplate @Bean (có timeout)
     */
    private String getAccessToken() {
        String auth = config.getPaypalClientId() + ":" + config.getPaypalSecret();
        String encodedAuth = Base64.getEncoder()
                .encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = paypalRestTemplate.exchange(
                config.getPaypalApi() + "/v1/oauth2/token",
                HttpMethod.POST,
                request,
                Map.class
        );

        return response.getBody().get("access_token").toString();
    }

    private String buildCustomId(Long userId, Long orderId, double amount) {
        String raw = "ORDER|" + userId + "|" + orderId + "|" + amount;
        return Base64.getUrlEncoder()
                .encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    private Long extractOrderIdFromPaypal(Map<String, Object> paypalData) {
        try {
            List<Map<String, Object>> units =
                    (List<Map<String, Object>>) paypalData.get("purchase_units");

            if (units != null && !units.isEmpty()) {
                String customId = units.get(0).get("custom_id").toString();

                String decoded = new String(
                        Base64.getUrlDecoder().decode(customId),
                        StandardCharsets.UTF_8
                );

                // Format: ORDER|userId|orderId|amount
                return Long.parseLong(decoded.split("\\|")[2]);
            }
        } catch (Exception e) {
            log.warn("⚠️ extractOrderIdFromPaypal failed", e);
        }

        return null;
    }

    private double convertVNDtoUSD(double amountVND) {
        return Math.round((amountVND / 25000.0) * 100.0) / 100.0;
    }
}