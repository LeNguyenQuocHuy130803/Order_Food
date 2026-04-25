package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Order;
import com.example.backend_Ecom.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    // Lấy orders của user với pagination
    Page<Order> findByUserId(Long userId, Pageable pageable);

    // 🔥 Lấy orders theo status và updated time (để transition dựa trên thời gian cập nhật status - CHÍNH XÁC)
    List<Order> findByStatusAndUpdatedAtBefore(OrderStatus status, LocalDateTime updatedAt);

    // Lấy orders theo status và created time (dùng cho scheduler fallback)
    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime createdAt);

    // 🔐 SECURITY: Verify order ownership - LUÔN CHECK khi capture payment
    // Để tránh user A capture order của user B
    Optional<Order> findByIdAndUserId(Long orderId, Long userId);
}
