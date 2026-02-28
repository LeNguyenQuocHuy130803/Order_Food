package com.example.backend_Ecom.dto;

import lombok.*;

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
}
