package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.*;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.security.UserPrincipal;
import com.example.backend_Ecom.service.RateLimitingService;
import com.example.backend_Ecom.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import lombok.RequiredArgsConstructor;

/**
 * REST Controller for user authentication endpoints
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final RateLimitingService rateLimitingService;

    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        if (!rateLimitingService.tryConsumeAuth(request.getEmail())) {
            throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED, "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 1 phút.");
        }
        LoginResponseDto result = this.userService.login(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Social login endpoint (Google, Facebook, GitHub)
     */
    @PostMapping("/social-login")
    public ResponseEntity<LoginResponseDto> socialLogin(@Valid @RequestBody SocialLoginRequestDto request) {
        LoginResponseDto result = this.userService.socialLogin(request);
        return ResponseEntity.ok(result);
    }

    /**
     * User registration endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        if (!rateLimitingService.tryConsumeAuth(request.getEmail())) {
            throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED, "Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 phút.");
        }
        RegisterResponseDto result = this.userService.register(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Refresh access token endpoint
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        RefreshTokenResponseDto result = this.userService.refreshToken(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Request password reset via email with OTP
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        if (!rateLimitingService.tryConsumeOtp(request.getEmail())) {
            throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED, "Quá nhiều yêu cầu gửi OTP. Vui lòng thử lại sau 1 phút.");
        }
        this.userService.forgotPassword(request);
        return ResponseEntity.ok(MessageResponseDto.builder()
                .success(true)
                .message("Password reset OTP has been sent to your email")
                .build());
    }

    /**
     * Reset password with OTP verification
     */
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDto> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        this.userService.resetPassword(request);
        return ResponseEntity.ok(MessageResponseDto.builder()
                .success(true)
                .message("Password has been reset successfully")
                .build());
    }

    /**
     * Send OTP to user's email for change password verification
     */
    @PostMapping("/change-password/send-otp")
    public ResponseEntity<MessageResponseDto> sendChangePasswordOtp(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (!rateLimitingService.tryConsumeOtp(principal.getUsername())) {
            throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED, "Quá nhiều yêu cầu gửi OTP. Vui lòng thử lại sau 1 phút.");
        }
        MessageResponseDto result = userService.sendChangePasswordOtp(principal.getId());
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ChangePassResponseDto> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePassRequestDto request
    ) {
        ChangePassResponseDto response = userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
