package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Cart;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Lấy cart của user theo userId (dùng cho đọc thông thường)
    Optional<Cart> findByUserId(Long userId);

    // ✅ FIX Double-Submit Race Condition: Khoá PESSIMISTIC khi Checkout
    // Chỉ 1 luồng được phép đọc+xử lý giỏ hàng cùng lúc → Ngăn tạo 2 đơn trùng nhau!
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithLock(@Param("userId") Long userId);
}
