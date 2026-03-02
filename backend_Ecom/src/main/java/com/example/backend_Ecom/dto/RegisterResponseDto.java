package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Schema(description = "DTO for register response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponseDto {

     Long id;
     String username;
     String phoneNumber;
     String email;
     String accessToken;
     List<String> roles;

}
