package com.example.backend_Ecom.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequestDto {
    
    @NotBlank(message = "Refresh token cannot be empty")
    private String refreshToken;
}
