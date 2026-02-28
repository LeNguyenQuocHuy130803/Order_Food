package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.entity.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class LoginResponseDto {
    Long id;
    String username;
    List<String> roles;
    String accessToken;

}