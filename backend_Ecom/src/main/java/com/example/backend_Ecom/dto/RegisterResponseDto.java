package com.example.backend_Ecom.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class RegisterResponseDto {

     Long id;
     String username;
     String phonenumber;
     String email;
     String accessToken;
     List<String> roles;

}
