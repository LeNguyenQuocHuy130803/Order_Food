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

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    
    // Lấy tất cả orders của một user
    List<Order> findByUserId(Long userId);
    
    // Lấy orders của user với pagination (FIX: query DB luôn)
    Page<Order> findByUserId(Long userId, Pageable pageable);
    
    // Lấy orders của user theo status
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);
    
    // Lấy orders theo status
    List<Order> findByStatus(OrderStatus status);
    
    // 🔥 Lấy orders theo status và created time (để tự động transition)
    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime createdAt);
}
