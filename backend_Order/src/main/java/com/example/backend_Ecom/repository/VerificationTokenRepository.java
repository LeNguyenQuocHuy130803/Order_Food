package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUserIdAndUsedFalse(Long userId);

    // ✅ FIX Lỗi #8: Xóa token rác hàng lô (used=true hoặc otp đã hết hạn)
    // Dùng bởi TokenCleanupScheduler chạy 2AM mỗi đêm
    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationToken t WHERE t.used = true OR t.otpExpiry < :now")
    int deleteExpiredAndUsedTokens(@Param("now") LocalDateTime now);
}
