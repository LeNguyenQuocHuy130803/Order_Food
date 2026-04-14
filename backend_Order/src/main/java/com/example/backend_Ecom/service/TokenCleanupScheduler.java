package com.example.backend_Ecom.service;

import com.example.backend_Ecom.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * ✅ FIX Lỗi #8: Dọn rác VerificationToken hết hạn / đã dùng
 * Ngăn bảng verification_tokens phình to vô hạn (DB Bloat)
 * Chạy lúc 2:00 AM mỗi đêm để dọn sạch token cũ kỹ
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class TokenCleanupScheduler {

    private final VerificationTokenRepository verificationTokenRepository;

    /**
     * Xóa tất cả VerificationToken đã được dùng (used=true) hoặc đã hết hạn OTP
     * Cron: "0 0 2 * * ?" = Mỗi ngày lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredVerificationTokens() {
        LocalDateTime now = LocalDateTime.now();

        // Xóa token đã used=true hoặc otp đã hết hạn
        int deletedCount = verificationTokenRepository.deleteExpiredAndUsedTokens(now);

        log.info("🧹 [TokenCleanup] Deleted {} expired/used verification tokens at {}", deletedCount, now);
    }
}
