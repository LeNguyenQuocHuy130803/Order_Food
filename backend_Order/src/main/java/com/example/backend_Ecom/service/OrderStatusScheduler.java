package com.example.backend_Ecom.service;

import com.example.backend_Ecom.entity.Order;
import com.example.backend_Ecom.enums.OrderStatus;
import com.example.backend_Ecom.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 🔥 Tự động chuyển trạng thái đơn hàng theo thời gian
 *
 * Flow:
 * PENDING (30p không thanh toán) → CANCELLED + hoàn kho
 * PAID (1p) → CONFIRMED
 * CONFIRMED (5p) → PREPARING
 * PREPARING (5p) → READY
 * READY (5p) → DELIVERING
 * DELIVERING (5p) → DELIVERED
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class OrderStatusScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    /**
     * ⏰ AUTO-CANCEL: PENDING → CANCELLED + hoàn kho (sau 30 phút không thanh toán)
     *
     * Khi user checkout nhưng KHÔNG thanh toán:
     *  - Kho đã bị trừ (reserved) khi tạo order
     *  - Sau 30 phút → tự động hủy order + hoàn lại kho
     *
     * Chạy mỗi 1 phút để detect order quá hạn
     */
    @Scheduled(fixedDelay = 60_000) // 1 phút
    public void autoCancelUnpaidOrders() {
        LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);

        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(
            OrderStatus.PENDING,
            thirtyMinutesAgo
        );

        if (expiredOrders.isEmpty()) {
            return;
        }

        log.info("⏰ Found {} PENDING order(s) unpaid > 30 minutes — auto-cancelling...", expiredOrders.size());

        for (Order order : expiredOrders) {
            try {
                orderService.cancelOrderBySystem(order.getId());
                log.info("✅ Order {} auto-cancelled: không thanh toán sau 30 phút — kho hàng đã hoàn lại", order.getId());
            } catch (Exception e) {
                log.error("❌ Failed to auto-cancel Order {}: {}", order.getId(), e.getMessage());
            }
        }
    }

    /**
     * ✅ PAID → CONFIRMED (sau 1 phút từ thanh toán)
     * Auto-transition sau khi payment capture thành công
     * Chạy mỗi 30 giây
     */
    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void transitionPaidToConfirmed() {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        List<Order> paidOrders = orderRepository.findByStatusAndUpdatedAtBefore(
            OrderStatus.PAID,
            oneMinuteAgo
        );

        for (Order order : paidOrders) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            log.info("✅ Order {} transitioned: PAID → CONFIRMED", order.getId());
        }
    }

    /**
     * ✅ CONFIRMED → PREPARING (sau 5 phút từ lúc được CONFIRMED)
     * Chạy mỗi 30 giây
     */
    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void transitionConfirmedToPreparing() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<Order> confirmedOrders = orderRepository.findByStatusAndUpdatedAtBefore(
            OrderStatus.CONFIRMED,
            fiveMinutesAgo
        );

        for (Order order : confirmedOrders) {
            order.setStatus(OrderStatus.PREPARING);
            orderRepository.save(order);
            log.info("🔄 Order {} transitioned: CONFIRMED → PREPARING", order.getId());
        }
    }

    /**
     * ✅ PREPARING → READY (sau 5 phút từ lúc được PREPARING)
     * Chạy mỗi 30 giây
     */
    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void transitionPreparingToReady() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<Order> preparingOrders = orderRepository.findByStatusAndUpdatedAtBefore(
            OrderStatus.PREPARING,
            fiveMinutesAgo
        );

        for (Order order : preparingOrders) {
            order.setStatus(OrderStatus.READY);
            orderRepository.save(order);
            log.info("🔄 Order {} transitioned: PREPARING → READY", order.getId());
        }
    }

    /**
     * ✅ READY → DELIVERING (sau 5 phút từ lúc được READY)
     * Chạy mỗi 30 giây
     */
    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void transitionReadyToDelivering() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<Order> readyOrders = orderRepository.findByStatusAndUpdatedAtBefore(
            OrderStatus.READY,
            fiveMinutesAgo
        );

        for (Order order : readyOrders) {
            order.setStatus(OrderStatus.DELIVERING);
            orderRepository.save(order);
            log.info("🚚 Order {} transitioned: READY → DELIVERING", order.getId());
        }
    }

    /**
     * ✅ DELIVERING → DELIVERED (sau 5 phút từ lúc được DELIVERING)
     * Chạy mỗi 30 giây
     */
    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void transitionDeliveringToDelivered() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<Order> deliveringOrders = orderRepository.findByStatusAndUpdatedAtBefore(
            OrderStatus.DELIVERING,
            fiveMinutesAgo
        );

        for (Order order : deliveringOrders) {
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
            log.info("✅ Order {} transitioned: DELIVERING → DELIVERED", order.getId());
        }
    }
}
