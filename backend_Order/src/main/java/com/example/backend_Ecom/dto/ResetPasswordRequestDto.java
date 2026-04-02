package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Schema(description = "DTO for reset password with OTP verification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequestDto {
    
    @Schema(description = "User email", example = "user@example.com")
    @Email(message = "Email must be valid")
    private String email;
    
    @Schema(description = "OTP code from email", example = "123456")
    @NotBlank(message = "OTP cannot be blank")
    private String otp;
    
    @Schema(description = "New password", example = "NewPass@123")
    @NotBlank(message = "Password cannot be blank")
    private String newPassword;
}
