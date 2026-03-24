package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "DTO for email verification request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyEmailRequestDto {
    @Schema(description = "User email", example = "huy@gmail.com")
    @Email(message = "Email must be valid")
    @NotBlank(message = "Email cannot be empty")
    private String email;

    @Schema(description = "OTP code (6 digits)", example = "123456")
    @NotBlank(message = "OTP cannot be empty")
    private String otp;
}
