package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.LoginRequestDto;
import com.example.backend_Ecom.dto.LoginResponseDto;
import com.example.backend_Ecom.dto.RegisterRequestDto;
import com.example.backend_Ecom.dto.RegisterResponseDto;
import com.example.backend_Ecom.dto.RefreshTokenRequestDto;
import com.example.backend_Ecom.dto.RefreshTokenResponseDto;
import com.example.backend_Ecom.entity.User;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.example.backend_Ecom.repository.UserJpaRepository;
import com.example.backend_Ecom.repository.RoleRepository;
import com.example.backend_Ecom.entity.Role;
import com.example.backend_Ecom.security.JwtService;

import java.util.stream.Collectors;

/**
 * Service for user authentication and management
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {
    private final JwtService jwtService;
    private final UserJpaRepository userJpaRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;

    /**
     * Authenticate user with email and password
     */
    public LoginResponseDto login(LoginRequestDto request) throws Exception {
        log.info("Login attempt for email: {}", request.getEmail());
        
        User user = userJpaRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found with email: {}", request.getEmail());
                    return new AppException(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for email: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        log.info("User logged in successfully: {}", request.getEmail());
        
        return LoginResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * Register new user
     */
    public RegisterResponseDto register(RegisterRequestDto request) throws Exception {
        log.info("Registration attempt for email: {}", request.getEmail());
        
        if (userJpaRepository.existsByEmail(request.getEmail())){
            log.warn("Registration failed: Email already exists: {}", request.getEmail());
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email already exists");
        }
        
        if (userJpaRepository.existsByPhoneNumber(request.getPhoneNumber())){
            log.warn("Registration failed: Phone number already exists: {}", request.getPhoneNumber());
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS, "Phone number already exists");
        }

        User user = new User();
        user.setRoles(new java.util.ArrayList<>());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUserName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());

        user = this.userJpaRepository.save(user);

        Role customerRole = roleRepository.findByName("Customers")
                .orElseThrow(() -> {
                    log.error("Role Customers not found in database");
                    return new AppException(ErrorCode.ROLE_NOT_FOUND, "Role Customers not found");
                });
        user.getRoles().add(customerRole);
        user = this.userJpaRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        
        log.info("User registered successfully: {}", request.getEmail());
        
        return RegisterResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .accessToken(accessToken)
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .build();
    }

    /**
     * Refresh access token using refresh token
     */
    public RefreshTokenResponseDto refreshToken(RefreshTokenRequestDto request) throws Exception {
        log.info("Refresh token request");
        
        String refreshToken = request.getRefreshToken();
        String username = jwtService.extractUsername(refreshToken);
        
        if (username == null) {
            log.warn("Refresh token failed: Invalid token format");
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid refresh token format");
        }
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        if (!jwtService.isRefreshTokenValid(refreshToken, userDetails)) {
            log.warn("Refresh token failed: Token validation failed for user: {}", username);
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Invalid or expired refresh token");
        }
        
        User user = userJpaRepository.findByEmail(username)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", username);
                    return new AppException(ErrorCode.USER_NOT_FOUND, "User not found");
                });
        
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        
        log.info("Token refreshed successfully for user: {}", username);
        
        return RefreshTokenResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }
}