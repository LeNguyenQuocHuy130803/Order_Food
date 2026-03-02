package com.example.backend_Ecom.dto;


import lombok.*;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "DTO for login response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    Long id;
    String username;
    List<String> roles;
    String accessToken;
    String refreshToken;


}