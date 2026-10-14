package com.example.backend_Ecom.service;

import com.example.backend_Ecom.entity.Order;
import com.example.backend_Ecom.enums.OrderStatus;
import com.example.backend_Ecom.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ⏰ Order Status Scheduler
 *
 * Nhiệm vụ duy nhất: Dọn dẹp đơn hàng PENDING quá hạn không thanh toán.
 * - Khi user checkout nhưng không thanh toán hoặc đóng tab trình duyệt:
 *   Sau 15 phút → Tự động chuyển đơn thành CANCELLED + hoàn kho ngay lập tức.
 * - Tần suất quét: 2 phút / lần (tiết kiệm tài nguyên kết nối DB & CPU).
 *
 * Các trạng thái vận chuyển (CONFIRMED, PREPARING, READY, DELIVERING, DELIVERED)
 * được quản lý chủ động bởi Admin/Nhân viên qua API PATCH /api/orders/{orderId}/status.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class OrderStatusScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    /**
     * ⏰ AUTO-CANCEL: PENDING → CANCELLED + hoàn kho (sau 15 phút không thanh toán)
     * Chạy định kỳ mỗi 2 phút (120,000 ms)
     */
    @Scheduled(fixedDelay = 120_000)
    public void autoCancelUnpaidOrders() {
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);

        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(
            OrderStatus.PENDING,
            fifteenMinutesAgo
        );

        if (expiredOrders.isEmpty()) {
            return;
        }

        log.info("⏰ Found {} PENDING order(s) unpaid > 15 minutes — auto-cancelling...", expiredOrders.size());

        for (Order order : expiredOrders) {
            // ✅ BUG-05: Bỏ qua đơn thanh toán tiền mặt (COD) — chỉ tự hủy đơn online quá hạn không thanh toán
            if (order.getPaymentMethod() != null &&
                (order.getPaymentMethod().equalsIgnoreCase("CASH") || order.getPaymentMethod().equalsIgnoreCase("COD"))) {
                continue;
            }

            try {
                orderService.cancelOrderBySystem(order.getId());
                log.info("✅ Order {} auto-cancelled: không thanh toán sau 15 phút — kho hàng đã hoàn lại", order.getId());
            } catch (Exception e) {
                log.error("❌ Failed to auto-cancel Order {}: {}", order.getId(), e.getMessage());
            }
        }
    }
}
