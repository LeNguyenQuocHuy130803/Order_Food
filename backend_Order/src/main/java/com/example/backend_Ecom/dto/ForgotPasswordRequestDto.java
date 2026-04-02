package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import lombok.*;

@Schema(description = "DTO for forgot password request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequestDto {
    
    @Schema(description = "User email", example = "user@example.com")
    @Email(message = "Email must be valid")
    private String email;
}
