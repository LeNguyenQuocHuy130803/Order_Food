package com.example.backend_Ecom.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;

/**
 * OTP Service for generating and validating One-Time Passwords
 */
@Slf4j
@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generate 6-digit OTP
     * @return OTP string (000000 - 999999)
     */
    public String generateOtp() {
        int otp = random.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", otp);
    }

    /**
     * Validate OTP format (must be 6 digits)
     * @param otp OTP to validate
     * @return true if valid format
     */
    public boolean isValidOtpFormat(String otp) {
        return otp != null && otp.matches("\\d{6}");
    }
}
