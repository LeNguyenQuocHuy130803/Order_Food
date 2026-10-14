package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Schema(description = "DTO for Social Login request (Google, Facebook, etc.)")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLoginRequestDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String name;

    private String avatar;

    private String provider; // e.g. "google", "facebook", "github"

    private String providerId; // optional provider unique account ID
}
