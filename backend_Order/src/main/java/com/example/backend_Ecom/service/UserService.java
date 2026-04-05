package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.LoginRequestDto;
import com.example.backend_Ecom.dto.LoginResponseDto;
import com.example.backend_Ecom.dto.RegisterRequestDto;
import com.example.backend_Ecom.dto.RegisterResponseDto;
import com.example.backend_Ecom.dto.RefreshTokenRequestDto;
import com.example.backend_Ecom.dto.RefreshTokenResponseDto;
import com.example.backend_Ecom.dto.UserResponseDto;
import com.example.backend_Ecom.dto.UserUpdateRequestDto;
import com.example.backend_Ecom.dto.PaginatedUserResponseDto;
import com.example.backend_Ecom.dto.VerifyEmailRequestDto;
import com.example.backend_Ecom.dto.AddressResponseDto;
import com.example.backend_Ecom.dto.ForgotPasswordRequestDto;
import com.example.backend_Ecom.dto.ResetPasswordRequestDto;
import com.example.backend_Ecom.entity.User;
import com.example.backend_Ecom.entity.VerificationToken;
import com.example.backend_Ecom.enums.UserStatus;
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
import com.example.backend_Ecom.repository.VerificationTokenRepository;
import com.example.backend_Ecom.entity.Role;
import com.example.backend_Ecom.security.JwtService;
import com.example.backend_Ecom.service.FileUploadService;
import com.example.backend_Ecom.service.EmailService;
import com.example.backend_Ecom.service.OtpService;

import java.util.stream.Collectors;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * Service for user authentication and management
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {
    // Account Lockout Configuration
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;
    private final JwtService jwtService;
    private final UserJpaRepository userJpaRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;
    private final FileUploadService fileUploadService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final OtpService otpService;

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

        // Check if account is locked due to multiple failed login attempts
        if (isAccountLocked(user)) {
            log.warn("Login failed: Account locked for email: {}", request.getEmail());
            throw new AppException(ErrorCode.ACCOUNT_LOCKED, 
                "Account is locked due to multiple failed login attempts. Please try again in " + 
                getMinutesUntilUnlock(user) + " minutes.");
        }

        // Check if email is verified
        if (!user.getEmailVerified()) {
            log.warn("Login failed: Email not verified for: {}", request.getEmail());
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED, "Please verify your email before logging in");
        }

        // Check if account status is active
        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login failed: Account status is {} for: {}", user.getStatus(), request.getEmail());
            throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Account is " + user.getStatus().getEnglishName().toLowerCase());
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for email: {}", request.getEmail());
            recordFailedLoginAttempt(user);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password");
        }

        // Reset failed login attempts on successful login
        resetFailedLoginAttempts(user);

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userJpaRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        log.info("User logged in successfully: {}", request.getEmail());
        
        return LoginResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatar(user.getAvatar())
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
        user.setAvatar(request.getAvatar());
        
        // Set email verification status and user status
        user.setEmailVerified(false);
        user.setStatus(UserStatus.ACTIVE);

        user = this.userJpaRepository.save(user);

        Role customerRole = roleRepository.findByName("Customers")
                .orElseThrow(() -> {
                    log.error("Role Customers not found in database");
                    return new AppException(ErrorCode.ROLE_NOT_FOUND, "Role Customers not found");
                });
        user.getRoles().add(customerRole);
        user = this.userJpaRepository.save(user);

        // Generate OTP for email verification
        String otp = otpService.generateOtp();
        LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(10);
        
        // Create verification token with OTP
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(user);
        verificationToken.setOtp(otp);
        verificationToken.setOtpExpiry(otpExpiry);
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24)); // Token link expiry (if needed for email link)
        verificationToken.setUsed(false);
        verificationTokenRepository.save(verificationToken);
        
        // Send verification email with OTP
        emailService.sendVerificationEmail(user.getEmail(), otp);
        log.info("Verification OTP sent to: {} | OTP: {}", user.getEmail(), otp);
        
        log.info("User registered successfully: {}", request.getEmail());
        
        return RegisterResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .accessToken(null) // No token until email is verified
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .build();
    }

    /**
     * Verify user email using OTP
     * @param request VerifyEmailRequestDto containing email and OTP
     * @return UserResponseDto with updated verification status
     */
    public UserResponseDto verifyEmail(VerifyEmailRequestDto request) {
        log.info("Email verification request for: {}", request.getEmail());
        
        // Find user by email
        User user = userJpaRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Email verification failed: User not found for email: {}", request.getEmail());
                    return new AppException(ErrorCode.USER_NOT_FOUND, "User not found");
                });
        
        // Check if email is already verified
        if (user.getEmailVerified()) {
            log.warn("Email verification failed: Email already verified for user: {}", request.getEmail());
            throw new AppException(ErrorCode.APP_EXCEPTION, "Email is already verified");
        }
        
        // Validate OTP format
        if (!otpService.isValidOtpFormat(request.getOtp())) {
            log.warn("Email verification failed: Invalid OTP format for user: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid OTP format. OTP must be 6 digits");
        }
        
        // Find active verification token for user
        VerificationToken verificationToken = verificationTokenRepository.findByUserIdAndUsedFalse(user.getId())
                .orElseThrow(() -> {
                    log.warn("Email verification failed: No active verification token for user: {}", request.getEmail());
                    return new AppException(ErrorCode.INVALID_TOKEN, "No active verification token found");
                });
        
        // Check if OTP has expired
        if (verificationToken.isOtpExpired()) {
            log.warn("Email verification failed: OTP expired for user: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "OTP has expired. Please request a new OTP");
        }
        
        // Validate OTP matches
        if (!verificationToken.getOtp().equals(request.getOtp())) {
            log.warn("Email verification failed: Invalid OTP for user: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid OTP. Please try again");
        }
        
        // Mark email as verified
        user.setEmailVerified(true);
        user = userJpaRepository.save(user);
        
        // Mark verification token as used
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
        
        // Send success email
        emailService.sendVerificationSuccessEmail(user.getEmail());
        log.info("Email verified successfully for user: {}", user.getEmail());
        
        // Return updated user data
        return mapToDto(user);
    }

    /**
     * Request password reset via OTP sent to email
     * @param request ForgotPasswordRequestDto containing email
     */
    public void forgotPassword(ForgotPasswordRequestDto request) {
        log.info("Forgot password request for: {}", request.getEmail());
        
        // Find user by email
        User user = userJpaRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Forgot password failed: User not found for email: {}", request.getEmail());
                    throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found");
                });
        
        // Generate OTP for password reset
        String otp = otpService.generateOtp();
        LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(10);
        
        // Create or update verification token for password reset
        // Mark any existing unused tokens as used to prevent multiple OTPs
        verificationTokenRepository.findByUserIdAndUsedFalse(user.getId())
                .ifPresent(token -> {
                    token.setUsed(true);
                    verificationTokenRepository.save(token);
                });
        
        // Create new password reset token
        VerificationToken resetToken = new VerificationToken();
        resetToken.setUser(user);
        resetToken.setOtp(otp);
        resetToken.setOtpExpiry(otpExpiry);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        resetToken.setUsed(false);
        verificationTokenRepository.save(resetToken);
        
        // Send password reset email with OTP
        emailService.sendPasswordResetEmail(user.getEmail(), otp);
        log.info("Password reset OTP sent to: {} | OTP: {}", user.getEmail(), otp);
    }

    /**
     * Reset password using OTP verification
     * @param request ResetPasswordRequestDto containing email, OTP, and new password
     */
    public void resetPassword(ResetPasswordRequestDto request) {
        log.info("Password reset request for: {}", request.getEmail());
        
        // Find user by email
        User user = userJpaRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Password reset failed: User not found for email: {}", request.getEmail());
                    throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found");
                });
        
        // Validate OTP format
        if (!otpService.isValidOtpFormat(request.getOtp())) {
            log.warn("Password reset failed: Invalid OTP format for user: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid OTP format. OTP must be 6 digits");
        }
        
        // Find active password reset token
        VerificationToken resetToken = verificationTokenRepository.findByUserIdAndUsedFalse(user.getId())
                .orElseThrow(() -> {
                    log.warn("Password reset failed: No active reset token for user: {}", request.getEmail());
                    throw new AppException(ErrorCode.INVALID_TOKEN, "No active password reset token found");
                });
        
        // Check if OTP has expired
        if (resetToken.isOtpExpired()) {
            log.warn("Password reset failed: OTP expired for user: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "OTP has expired. Please request a new password reset");
        }
        
        // Validate OTP matches
        if (!resetToken.getOtp().equals(request.getOtp())) {
            log.warn("Password reset failed: Invalid OTP for user: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid OTP. Please try again");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setIsAccountLocked(false);
        user.setFailedLoginAttempts(0);
        user = userJpaRepository.save(user);
        
        // Mark reset token as used
        resetToken.setUsed(true);
        verificationTokenRepository.save(resetToken);
        
        // Send password reset success email
        emailService.sendPasswordResetSuccessEmail(user.getEmail());
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    /**
     * Refresh access token using refresh token
     */
    public RefreshTokenResponseDto refreshToken(RefreshTokenRequestDto request) throws Exception {
        log.info("Refresh token request");
        
        String refreshToken = request.getRefreshToken();
        String email = jwtService.extractEmail(refreshToken);  // Extract email from token
        
        if (email == null) {
            log.warn("Refresh token failed: Invalid token format");
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid refresh token format");
        }
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);  // Load user by email
        
        if (!jwtService.isRefreshTokenValid(refreshToken, userDetails)) {
            log.warn("Refresh token failed: Token validation failed for user: {}", email);
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Invalid or expired refresh token");
        }
        
        User user = userJpaRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", email);
                    return new AppException(ErrorCode.USER_NOT_FOUND, "User not found");
                });
        
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        
        log.info("Token refreshed successfully for user: {}", email);
        
        return RefreshTokenResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    /**
     * Check if user account is locked due to failed login attempts
     * @param user User entity
     * @return true if account is locked and lockout period hasn't expired
     */
    private boolean isAccountLocked(User user) {
        if (!user.getIsAccountLocked()) {
            return false;
        }

        // Check if lockout period has expired
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lockoutExpiry = user.getLockoutTime().plus(LOCKOUT_DURATION_MINUTES, ChronoUnit.MINUTES);

        if (now.isAfter(lockoutExpiry)) {
            // Lockout period has expired, unlock the account
            unlockAccount(user);
            return false;
        }

        return true;
    }

    /**
     * Record a failed login attempt and lock account if max attempts exceeded
     * @param user User entity
     */
    private void recordFailedLoginAttempt(User user) {
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

        if (user.getFailedLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
            user.setIsAccountLocked(true);
            user.setLockoutTime(LocalDateTime.now());
            log.warn("Account locked for user: {} due to {} failed login attempts", 
                    user.getEmail(), user.getFailedLoginAttempts());
        }

        userJpaRepository.save(user);
    }

    /**
     * Reset failed login attempts after successful login
     * @param user User entity
     */
    private void resetFailedLoginAttempts(User user) {
        if (user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            user.setIsAccountLocked(false);
            user.setLockoutTime(null);
            userJpaRepository.save(user);
            log.info("Failed login attempts reset for user: {}", user.getEmail());
        }
    }

    /**
     * Unlock a locked account
     * @param user User entity
     */
    private void unlockAccount(User user) {
        user.setIsAccountLocked(false);
        user.setFailedLoginAttempts(0);
        user.setLockoutTime(null);
        userJpaRepository.save(user);
        log.info("Account unlocked for user: {}", user.getEmail());
    }

    /**
     * Get remaining minutes until account unlocks
     * @param user User entity
     * @return minutes remaining
     */
    private long getMinutesUntilUnlock(User user) {
        if (user.getLockoutTime() == null) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lockoutExpiry = user.getLockoutTime().plus(LOCKOUT_DURATION_MINUTES, ChronoUnit.MINUTES);
        
        long minutesRemaining = ChronoUnit.MINUTES.between(now, lockoutExpiry);
        return Math.max(minutesRemaining, 1); // Minimum 1 minute
    }

    /**
     * Get all users (non-paginated)
     */
    public List<UserResponseDto> getAllUsers() {
        log.info("Fetching all users");
        return userJpaRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all users with pagination
     */
    public PaginatedUserResponseDto getAllUsersPaginated(int page, int size) {
        // Convert 1-based page to 0-based for Spring Data
        Pageable pageable = PageRequest.of(page - 1, size);

        // Lấy dữ liệu phân trang từ repository
        Page<User> userPage = userJpaRepository.findAll(pageable);

        // Chuyển đổi Page<User> thành List<UserResponseDto>
        List<UserResponseDto> userDtos = userPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Tạo response DTO với thông tin phân trang (convert back to 1-based for response)
        return PaginatedUserResponseDto.builder()
                .data(userDtos)
                .pageNumber(userPage.getNumber() + 1)  // Convert back to 1-based
                .pageSize(userPage.getSize())
                .totalRecords(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .build();
    }

    /**
     * Get user by ID
     */
    public UserResponseDto getUserById(Long id) {
        User user = userJpaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + id));
        return mapToDto(user);
    }

    /**
     * Update user information
     */
    public UserResponseDto updateUser(Long id, UserUpdateRequestDto request) {
        log.info("Updating user: {}", id);
        
        User user = userJpaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + id));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Check if email is already used by another user
            if (!user.getEmail().equals(request.getEmail()) && 
                userJpaRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getUserName() != null && !request.getUserName().isBlank()) {
            user.setUsername(request.getUserName());
        }
        
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            // Check if phone number is already used by another user
            if (!user.getPhoneNumber().equals(request.getPhoneNumber()) && 
                userJpaRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS, "Phone number already exists");
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }
        
        // Handle avatar - either upload file or use URL
        String avatarUrl = resolveAvatar(request, user.getAvatar());
        if (avatarUrl != null) {
            user.setAvatar(avatarUrl);
        }

        user = userJpaRepository.save(user);
        log.info("User updated successfully: {}", id);
        
        return mapToDto(user);
    }

    /**
     * Resolve avatar - either upload file or use URL
     */
    private String resolveAvatar(UserUpdateRequestDto request, String currentAvatar) {
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            // Delete old avatar if exists
            if (currentAvatar != null) {
                fileUploadService.deleteImage(currentAvatar);
            }
            // Upload new avatar
            return fileUploadService.uploadImage(request.getAvatar());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            return request.getAvatarUrl();
        }

        return currentAvatar;
    }

    /**
     * Map User entity to UserResponseDto
     */
    private UserResponseDto mapToDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .userName(user.getUsername())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .role(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.joining(", ")))
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .lastLogin(user.getLastLogin())
                .addresses(user.getAddresses() != null ? 
                    user.getAddresses().stream()
                        .map(address -> AddressResponseDto.builder()
                            .id(address.getId())
                            .type(address.getType())
                            .address(address.getAddress())
                            .isDefault(address.getIsDefault())
                            .createdAt(address.getCreatedAt())
                            .updatedAt(address.getUpdatedAt())
                            .build())
                        .collect(Collectors.toList())
                    : new java.util.ArrayList<>())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}