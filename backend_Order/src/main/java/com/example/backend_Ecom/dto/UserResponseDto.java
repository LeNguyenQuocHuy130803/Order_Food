package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "DTO for user response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String email;
    private String userName;
    private String phoneNumber;
    private String role;
    private String avatar;
    private UserStatus status;
    private Boolean emailVerified;
    private LocalDateTime lastLogin;
    private List<AddressResponseDto> addresses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
