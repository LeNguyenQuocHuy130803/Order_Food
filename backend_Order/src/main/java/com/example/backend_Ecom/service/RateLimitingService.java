package com.example.backend_Ecom.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> otpBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();

    /**
     * Rate limit for sending OTP: maximum 3 requests per minute per identifier (email or IP)
     */
    public boolean tryConsumeOtp(String key) {
        Bucket bucket = otpBuckets.computeIfAbsent(key, k -> createOtpBucket());
        return bucket.tryConsume(1);
    }

    /**
     * Rate limit for login / auth attempts: maximum 10 requests per minute per identifier (email or IP)
     */
    public boolean tryConsumeAuth(String key) {
        Bucket bucket = authBuckets.computeIfAbsent(key, k -> createAuthBucket());
        return bucket.tryConsume(1);
    }

    private Bucket createOtpBucket() {
        Refill refill = Refill.greedy(3, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(3, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createAuthBucket() {
        Refill refill = Refill.greedy(10, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(10, refill);
        return Bucket.builder().addLimit(limit).build();
    }
}
