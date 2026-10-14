package com.example.backend_Ecom.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
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
     * Send OTP email for change password verification
     * @param email User email
     * @param otp 6-digit OTP code
     */
    @Async
    public void sendChangePasswordOtpEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Mã xác nhận đổi mật khẩu - Food Fresh");
            message.setText(
                "Chào bạn!\n\n" +
                "Bạn đã yêu cầu đổi mật khẩu tài khoản.\n\n" +
                "Mã OTP xác nhận: " + otp + "\n\n" +
                "Mã này sẽ hết hạn trong 5 phút.\n\n" +
                "Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bảo mật tài khoản của bạn ngay.\n\n" +
                "Trân trọng,\n" +
                "Food Fresh Team"
            );

            javaMailSender.send(message);
            log.info("✓ Change password OTP email sent to: {}", email);
        } catch (Exception e) {
            log.error("✗ Failed to send change password OTP email to {}: {}", email, e.getMessage());
            throw new AppException(ErrorCode.APP_EXCEPTION, "Failed to send OTP email");
        }
    }


    /**
     * Send password reset email with OTP
     * @param email User email
     * @param otp 6-digit OTP code
     */
    @Async
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
            log.info("✓ Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("✗ Failed to send password reset email to {}: {}", email, e.getMessage());
            throw new AppException(ErrorCode.APP_EXCEPTION, "Failed to send password reset email");
        }
    }

    /**
     * Send password reset success confirmation email
     * @param email User email
     */
    @Async
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
