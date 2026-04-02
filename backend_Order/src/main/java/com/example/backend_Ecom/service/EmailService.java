package com.example.backend_Ecom.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;

/**
 * Email service for sending verification emails via Gmail SMTP
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${app.mail.from:noreply@foodfresh.com}")
    private String fromEmail;

    /**
     * Send verification email with OTP to user
     * @param email User email
     * @param otp 6-digit OTP code
     */
    public void sendVerificationEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Mã xác minh email - Food Fresh");
            message.setText(
                "Chào bạn!\n\n" +
                "Mã OTP của bạn là: " + otp + "\n\n" +
                "Mã này sẽ hết hạn trong 10 phút.\n\n" +
                "Nếu bạn không yêu cầu xác minh email này, vui lòng bỏ qua email này.\n\n" +
                "Trân trọng,\n" +
                "Food Fresh Team"
            );

            javaMailSender.send(message);
            log.info("✓ Verification email sent to: {} with OTP: {}", email, otp);
        } catch (Exception e) {
            log.error("✗ Failed to send verification email to {}: {}", email, e.getMessage());
            throw new AppException(ErrorCode.APP_EXCEPTION, "Failed to send verification email");
        }
    }

    /**
     * Send email verification success confirmation
     * @param email User email
     */
    public void sendVerificationSuccessEmail(String email) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Email đã được xác minh - Food Fresh");
            message.setText(
                "Chào bạn!\n\n" +
                "Chúc mừng! Email của bạn đã được xác minh thành công.\n\n" +
                "Bây giờ bạn có thể đăng nhập và bắt đầu mua sắm.\n\n" +
                "Trân trọng,\n" +
                "Food Fresh Team"
            );

            javaMailSender.send(message);
            log.info("✓ Verification success email sent to: {}", email);
        } catch (Exception e) {
            log.error("✗ Failed to send success email to {}: {}", email, e.getMessage());
            // Don't throw exception here - verification already succeeded
        }
    }

    /**
     * Send password reset email with OTP
     * @param email User email
     * @param otp 6-digit OTP code
     */
    public void sendPasswordResetEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Mã đặt lại mật khẩu - Food Fresh");
            message.setText(
                "Chào bạn!\n\n" +
                "Bạn đã yêu cầu đặt lại mật khẩu của bạn.\n\n" +
                "Mã OTP để đặt lại mật khẩu: " + otp + "\n\n" +
                "Mã này sẽ hết hạn trong 10 phút.\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                "Trân trọng,\n" +
                "Food Fresh Team"
            );

            javaMailSender.send(message);
            log.info("✓ Password reset email sent to: {} with OTP: {}", email, otp);
        } catch (Exception e) {
            log.error("✗ Failed to send password reset email to {}: {}", email, e.getMessage());
            throw new AppException(ErrorCode.APP_EXCEPTION, "Failed to send password reset email");
        }
    }

    /**
     * Send password reset success confirmation email
     * @param email User email
     */
    public void sendPasswordResetSuccessEmail(String email) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Mật khẩu đã được đặt lại - Food Fresh");
            message.setText(
                "Chào bạn!\n\n" +
                "Mật khẩu của bạn đã được đặt lại thành công.\n\n" +
                "Bây giờ bạn có thể đăng nhập bằng mật khẩu mới của mình.\n\n" +
                "Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.\n\n" +
                "Trân trọng,\n" +
                "Food Fresh Team"
            );

            javaMailSender.send(message);
            log.info("✓ Password reset success email sent to: {}", email);
        } catch (Exception e) {
            log.error("✗ Failed to send password reset success email to {}: {}", email, e.getMessage());
            // Don't throw exception here - password reset already succeeded
        }
    }
}
