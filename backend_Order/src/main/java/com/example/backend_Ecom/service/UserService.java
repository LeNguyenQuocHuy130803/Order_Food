package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.*;
import com.example.backend_Ecom.entity.User;
import com.example.backend_Ecom.entity.VerificationToken;
import com.example.backend_Ecom.enums.RoleName;
import com.example.backend_Ecom.enums.UserStatus;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.example.backend_Ecom.repository.UserJpaRepository;
import com.example.backend_Ecom.repository.RoleRepository;
import com.example.backend_Ecom.repository.VerificationTokenRepository;
import com.example.backend_Ecom.entity.Role;
import com.example.backend_Ecom.security.JwtService;
import com.example.backend_Ecom.security.UserPrincipal;

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
    @Transactional
    public LoginResponseDto login(LoginRequestDto request) {
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
     * Social login (Google, Facebook, GitHub)
     * Auto-creates user if not exists, or updates info and generates tokens
     */
    @Transactional
    public LoginResponseDto socialLogin(SocialLoginRequestDto request) {
        log.info("Social login attempt for email: {}, provider: {}", request.getEmail(), request.getProvider());

        User user = userJpaRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            // Tạo mới user từ thông tin Google / Facebook
            user = new User();
            user.setRoles(new java.util.ArrayList<>());
            user.setEmail(request.getEmail());
            String displayName = (request.getName() != null && !request.getName().isBlank())
                    ? request.getName()
                    : request.getEmail().split("@")[0];
            user.setUsername(displayName);
            // Password ngẫu nhiên bảo mật cao để không ai đoán được
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            if (request.getAvatar() != null && !request.getAvatar().isBlank()) {
                user.setAvatar(request.getAvatar());
            }
            user.setStatus(UserStatus.ACTIVE);
            user.setEmailVerified(true);
            user.setFailedLoginAttempts(0);
            user.setIsAccountLocked(false);

            // Gán role CUSTOMER mặc định
            Role customerRole = roleRepository.findByName(RoleName.CUSTOMER.name())
                    .orElseGet(() -> {
                        log.warn("Role {} not found, auto-creating...", RoleName.CUSTOMER.name());
                        Role newRole = new Role();
                        newRole.setName(RoleName.CUSTOMER.name());
                        return roleRepository.save(newRole);
                    });
            user.getRoles().add(customerRole);
            user = userJpaRepository.save(user);
            log.info("✓ Auto-created new user via OAuth: {}", user.getEmail());
        } else {
            // User đã tồn tại: cập nhật avatar nếu chưa có
            if ((user.getAvatar() == null || user.getAvatar().isBlank()) && request.getAvatar() != null && !request.getAvatar().isBlank()) {
                user.setAvatar(request.getAvatar());
            }
            if (user.getStatus() != UserStatus.ACTIVE) {
                throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Account is " + user.getStatus().getEnglishName().toLowerCase());
            }
            user.setIsAccountLocked(false);
            user.setFailedLoginAttempts(0);
        }

        user.setLastLogin(LocalDateTime.now());
        user = userJpaRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.info("User logged in via OAuth successfully: {}", user.getEmail());

        return LoginResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * Register new user
     */
    @Transactional
    public RegisterResponseDto register(RegisterRequestDto request) {
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

        // Email verified by default - no verification step needed for e-commerce
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);

        user = this.userJpaRepository.save(user);

        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER.name())
                .orElseGet(() -> {
                    log.warn("Role {} not found in database, auto-creating it...", RoleName.CUSTOMER.name());
                    Role newRole = new Role();
                    newRole.setName(RoleName.CUSTOMER.name());
                    return roleRepository.save(newRole);
                });
        user.getRoles().add(customerRole);
        user = this.userJpaRepository.save(user);

        log.info("User registered successfully: {}", request.getEmail());

        return RegisterResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .accessToken(null)
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .build();
    }

    /**
     * Request password reset via OTP sent to email
     * @param request ForgotPasswordRequestDto containing email
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequestDto request) {
        log.info("Forgot password request for: {}", request.getEmail());

        // Find user by email
        User user = userJpaRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Forgot password failed: User not found for email: {}", request.getEmail());
                    return new AppException(ErrorCode.USER_NOT_FOUND, "User not found");
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

        // Create new password reset token with HASHED OTP
        VerificationToken resetToken = new VerificationToken();
        resetToken.setUser(user);
        resetToken.setOtp(passwordEncoder.encode(otp));
        resetToken.setOtpExpiry(otpExpiry);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        resetToken.setUsed(false);
        verificationTokenRepository.save(resetToken);

        // Send password reset email with PLAIN TEXT OTP
        emailService.sendPasswordResetEmail(user.getEmail(), otp);
        log.info("Password reset OTP sent to: {}", user.getEmail());
    }

    /**
     * Reset password using OTP verification
     * @param request ResetPasswordRequestDto containing email, OTP, and new password
     */
    @Transactional
    public void resetPassword(ResetPasswordRequestDto request) {
        log.info("Password reset request for: {}", request.getEmail());

        // Find user by email
        User user = userJpaRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Password reset failed: User not found for email: {}", request.getEmail());
                    return new AppException(ErrorCode.USER_NOT_FOUND, "User not found");
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
                    return new AppException(ErrorCode.INVALID_TOKEN, "No active password reset token found");
                });

        // Check if OTP has expired
        if (resetToken.isOtpExpired()) {
            log.warn("Password reset failed: OTP expired for user: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "OTP has expired. Please request a new password reset");
        }

        // Validate OTP matches (USING BCRYPT MATCHES)
        if (!passwordEncoder.matches(request.getOtp(), resetToken.getOtp())) {
            log.warn("Password reset failed: Invalid OTP for user: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid OTP. Please try again");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setIsAccountLocked(false);
        user.setFailedLoginAttempts(0);
        userJpaRepository.save(user);

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
    @Transactional(readOnly = true)
    public RefreshTokenResponseDto refreshToken(RefreshTokenRequestDto request) {
        log.info("Refresh token request");

        String refreshToken = request.getRefreshToken();
        String email = jwtService.extractEmail(refreshToken);

        if (email == null) {
            log.warn("Refresh token failed: Invalid token format");
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid refresh token format");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

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
        return Math.max(minutesRemaining, 1);
    }

    /**
     * Get all users (non-paginated)
     */
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public PaginatedUserResponseDto getAllUsersPaginated(int page, int size) {
        if (page < 1) page = 1;
        if (size < 1) size = 10;

        // Convert 1-based page to 0-based for Spring Data
        Pageable pageable = PageRequest.of(page - 1, size);

        // Lấy dữ liệu phân trang từ repository
        Page<User> userPage = userJpaRepository.findAll(pageable);

        // Chuyển đổi Page<User> thành List<UserResponseDto>
        List<UserResponseDto> userDtos = userPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Tạo response DTO với thông tin phân trang
        return PaginatedUserResponseDto.builder()
                .data(userDtos)
                .pageNumber(userPage.getNumber() + 1)
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
    @Transactional(readOnly = true)
    public UserResponseDto getUserById(Long id, UserPrincipal currentUser) {
        validateUserAccess(id, currentUser);

        User user = userJpaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + id));
        return mapToDto(user);
    }

    /**
     * Update user information
     */
    @Transactional
    public UserResponseDto updateUser(Long id, UserUpdateRequestDto request, UserPrincipal currentUser) {
        validateUserAccess(id, currentUser);
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
            if ((user.getPhoneNumber() == null || !user.getPhoneNumber().equals(request.getPhoneNumber())) &&
                    userJpaRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS, "Phone number already exists");
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }

        // Handle avatar - either upload file or use URL
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            String oldAvatarUrl = user.getAvatar();
            String newAvatarUrl = fileUploadService.uploadImage(request.getAvatar());
            user.setAvatar(newAvatarUrl);
            user = userJpaRepository.save(user);
            userJpaRepository.flush(); // Ép commit xuống DB trước khi xóa ảnh cũ

            // Chỉ sau khi DB đã commit, mới thực sự xóa ảnh cũ trên Cloudinary
            if (oldAvatarUrl != null) {
                try {
                    fileUploadService.deleteImage(oldAvatarUrl);
                } catch (Exception e) {
                    log.warn("⚠️ Avatar updated in DB but old Cloudinary image deletion failed for user: {}. URL: {}", id, oldAvatarUrl);
                }
            }
        } else if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatar(request.getAvatarUrl());
            user = userJpaRepository.save(user);
        } else {
            user = userJpaRepository.save(user);
        }
        log.info("User updated successfully: {}", id);

        return mapToDto(user);
    }

    private void validateUserAccess(Long requestedUserId, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }

        boolean isOwner = currentUser.getId().equals(requestedUserId);
        boolean isAdmin = currentUser.hasRole(RoleName.ADMIN.name());

        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to access this user");
        }
    }

    /**
     * Send OTP to user's email for change password verification
     */
    @Transactional
    public MessageResponseDto sendChangePasswordOtp(Long id) {
        log.info("Sending change password OTP for user ID: {}", id);

        User user = userJpaRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Send OTP failed: User not found with ID: {}", id);
                    return new AppException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + id);
                });

        // Invalidate any existing unused tokens
        verificationTokenRepository.findByUserIdAndUsedFalse(user.getId())
                .ifPresent(token -> {
                    token.setUsed(true);
                    verificationTokenRepository.save(token);
                });

        // Generate OTP
        String otp = otpService.generateOtp();
        LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(5);

        // Create verification token with HASHED OTP
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(user);
        verificationToken.setOtp(passwordEncoder.encode(otp));
        verificationToken.setOtpExpiry(otpExpiry);
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        verificationToken.setUsed(false);
        verificationTokenRepository.save(verificationToken);

        // Send OTP email
        emailService.sendChangePasswordOtpEmail(user.getEmail(), otp);
        log.info("Change password OTP sent to: {}", user.getEmail());

        return MessageResponseDto.builder()
                .success(true)
                .message("Mã OTP đã được gửi đến email " + user.getEmail())
                .build();
    }

    /**
     * Change user password with OTP verification
     */
    @Transactional
    public ChangePassResponseDto changePassword(Long id, ChangePassRequestDto request) {
        log.info("Changing password for user ID: {}", id);

        // 1. Tìm user
        User user = userJpaRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Change password failed: User not found with ID: {}", id);
                    return new AppException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + id);
                });

        // 2. Xác thực OTP
        if (!otpService.isValidOtpFormat(request.getOtp())) {
            log.warn("Change password failed: Invalid OTP format for user: {}", user.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "OTP phải có 6 chữ số");
        }

        VerificationToken verificationToken = verificationTokenRepository.findByUserIdAndUsedFalse(user.getId())
                .orElseThrow(() -> {
                    log.warn("Change password failed: No active OTP for user: {}", user.getEmail());
                    return new AppException(ErrorCode.INVALID_TOKEN, "Không tìm thấy mã OTP. Vui lòng gửi lại mã");
                });

        if (verificationToken.isOtpExpired()) {
            log.warn("Change password failed: OTP expired for user: {}", user.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới");
        }

        if (!passwordEncoder.matches(request.getOtp(), verificationToken.getOtp())) {
            log.warn("Change password failed: Invalid OTP for user: {}", user.getEmail());
            throw new AppException(ErrorCode.INVALID_TOKEN, "Mã OTP không đúng. Vui lòng thử lại");
        }

        // 3. Kiểm tra mật khẩu cũ (BCrypt so sánh)
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            log.warn("Change password failed: Incorrect old password for user: {}", user.getEmail());
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu cũ không chính xác");
        }

        // 4. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        // 5. Mã hóa mật khẩu mới và lưu
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setIsAccountLocked(false);
        user.setFailedLoginAttempts(0);
        userJpaRepository.save(user);

        // 6. Đánh dấu OTP đã sử dụng
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);

        log.info("Password changed successfully for user: {}", user.getEmail());

        return new ChangePassResponseDto("Đổi mật khẩu thành công", true);
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
                                        .phoneNumber(address.getPhoneNumber())
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