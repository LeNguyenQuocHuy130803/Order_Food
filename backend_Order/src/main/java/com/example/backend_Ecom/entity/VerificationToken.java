package com.example.backend_Ecom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
    name = "verification_tokens",
    // ✅ FIX Lỗi #8: Đánh Index composite (user_id + used) — tăng tốc query findByUserIdAndUsedFalse
    // Trước: Full Table Scan O(N) | Sau: Index Seek O(log N)
    indexes = {
        @Index(name = "idx_vt_user_id_used", columnList = "user_id, used")
    }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 500)
    private String token;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(name = "otp_expiry", nullable = false)
    private LocalDateTime otpExpiry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean used = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }

    public boolean isOtpExpired() {
        return LocalDateTime.now().isAfter(this.otpExpiry);
    }
}
