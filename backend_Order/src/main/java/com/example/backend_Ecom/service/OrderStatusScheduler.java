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
 * CONFIRMED (5 phút) → PREPARING (10 phút) → READY (5 phút) → DELIVERING (5 phút) → DELIVERED
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class OrderStatusScheduler {

    private final OrderRepository orderRepository;

    /**
     * ✅ PENDING → CONFIRMED (sau 5 phút từ tạo hoặc khách confirm thủ công)
     * Auto-confirm nếu khách không confirm thủ công
     * Chạy mỗi 30 giây để check orders cần confirming
     */
    @Scheduled(fixedDelay = 30000) // 30 seconds
    @Transactional
    public void transitionPendingToConfirmed() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<Order> pendingOrders = orderRepository.findByStatusAndCreatedAtBefore(
            OrderStatus.PENDING,
            fiveMinutesAgo
        );

        for (Order order : pendingOrders) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            log.info("✅ Order {} auto-confirmed after 5 minutes (no manual confirmation received)", order.getId());
        }
    }

    /**
     * ✅ CONFIRMED → PREPARING (sau 5 phút từ tạo)
     * Chạy mỗi 30 giây để check orders cần updating
     */
    @Scheduled(fixedDelay = 30000) // 30 seconds
    @Transactional
    public void transitionConfirmedToPrepairing() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<Order> confirmedOrders = orderRepository.findByStatusAndCreatedAtBefore(
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
     * ✅ PREPARING → READY (sau 15 phút từ tạo = 5+10)
     * Chạy mỗi 30 giây
     */
    @Scheduled(fixedDelay = 30000) // 30 seconds
    @Transactional
    public void transitionPreparingToReady() {
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
        List<Order> preparingOrders = orderRepository.findByStatusAndCreatedAtBefore(
            OrderStatus.PREPARING,
            fifteenMinutesAgo
        );

        for (Order order : preparingOrders) {
            order.setStatus(OrderStatus.READY);
            orderRepository.save(order);
            log.info("🔄 Order {} transitioned: PREPARING → READY", order.getId());
        }
    }

    /**
     * ✅ READY → DELIVERING (sau 20 phút từ tạo = 5+10+5)
     * Tự động, không cần shipper quét
     */
    @Scheduled(fixedDelay = 30000) // 30 seconds
    @Transactional
    public void transitionReadyToDelivering() {
        LocalDateTime twentyMinutesAgo = LocalDateTime.now().minusMinutes(20);
        List<Order> readyOrders = orderRepository.findByStatusAndCreatedAtBefore(
            OrderStatus.READY,
            twentyMinutesAgo
        );

        for (Order order : readyOrders) {
            order.setStatus(OrderStatus.DELIVERING);
            orderRepository.save(order);
            log.info("🚚 Order {} transitioned: READY → DELIVERING (auto shipper)", order.getId());
        }
    }

    /**
     * ✅ DELIVERING → DELIVERED (sau 25 phút từ tạo = 5+10+5+5)
     * Tự động giao xong
     */
    @Scheduled(fixedDelay = 30000) // 30 seconds
    @Transactional
    public void transitionDeliveringToDelivered() {
        LocalDateTime twentyFiveMinutesAgo = LocalDateTime.now().minusMinutes(25);
        List<Order> deliveringOrders = orderRepository.findByStatusAndCreatedAtBefore(
            OrderStatus.DELIVERING,
            twentyFiveMinutesAgo
        );

        for (Order order : deliveringOrders) {
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
            log.info("✅ Order {} transitioned: DELIVERING → DELIVERED (auto complete)", order.getId());
        }
    }
}
