package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.LoginRequestDto;
import com.example.backend_Ecom.dto.LoginResponseDto;
import com.example.backend_Ecom.dto.RegisterRequestDto;
import com.example.backend_Ecom.dto.RegisterResponseDto;
import com.example.backend_Ecom.dto.RefreshTokenRequestDto;
import com.example.backend_Ecom.dto.RefreshTokenResponseDto;
import com.example.backend_Ecom.dto.VerifyEmailRequestDto;
import com.example.backend_Ecom.dto.UserResponseDto;
import com.example.backend_Ecom.dto.ForgotPasswordRequestDto;
import com.example.backend_Ecom.dto.ResetPasswordRequestDto;
import com.example.backend_Ecom.dto.MessageResponseDto;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import com.example.backend_Ecom.service.UserService;

/**
 * REST Controller for user authentication endpoints
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) throws Exception {
        LoginResponseDto result = this.userService.login(request);
        return ResponseEntity.ok(result);
    }

    /**
     * User registration endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto request) throws Exception {
        RegisterResponseDto result = this.userService.register(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Refresh access token endpoint
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) throws Exception {
        RefreshTokenResponseDto result = this.userService.refreshToken(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Verify user email with OTP endpoint
     */
    @PostMapping("/verify-email")
    public ResponseEntity<UserResponseDto> verifyEmail(@Valid @RequestBody VerifyEmailRequestDto request) {
        UserResponseDto result = this.userService.verifyEmail(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Request password reset via email with OTP
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
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
}
