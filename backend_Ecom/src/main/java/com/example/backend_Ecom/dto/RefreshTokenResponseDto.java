package com.example.backend_Ecom.dto;

import lombok.*;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO for refresh token response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenResponseDto {
    
    String accessToken;
    String refreshToken;
}
