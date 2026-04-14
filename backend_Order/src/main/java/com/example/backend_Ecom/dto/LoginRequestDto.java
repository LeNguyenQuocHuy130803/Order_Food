package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Schema(description = "DTO for login request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {

    @NotBlank(message = "Username or email cannot be empty")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    private String password;

}



