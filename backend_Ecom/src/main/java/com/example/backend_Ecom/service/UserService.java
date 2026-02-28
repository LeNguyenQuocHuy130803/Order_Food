package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.LoginRequestDto;
import com.example.backend_Ecom.dto.LoginResponseDto;
import com.example.backend_Ecom.dto.RegisterRequestDto;
import com.example.backend_Ecom.dto.RegisterResponseDto;
import com.example.backend_Ecom.entity.User;
import com.example.backend_Ecom.exception.HttpException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;
import com.example.backend_Ecom.repository.UserJpaRepository;
import com.example.backend_Ecom.repository.RoleRepository;
import com.example.backend_Ecom.entity.Role;
import com.example.backend_Ecom.security.JwtService;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserService {
    private final JwtService jwtService;
    private final UserJpaRepository userJpaRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDto login(LoginRequestDto request) throws Exception {
        // Tìm user bằng email trước, nếu không có thì tìm bằng username
        User user = userJpaRepository.findByEmail(request.getUsernameOrEmail())
                .or(() -> userJpaRepository.findByUsername(request.getUsernameOrEmail()))
                .orElseThrow(() -> new HttpException("Invalid username or password", HttpStatus.UNAUTHORIZED));

        // So sánh password được hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new HttpException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        String accessToken = jwtService.generateAccessToken(user);
        return LoginResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .accessToken(accessToken)
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .build();
    }

    public RegisterResponseDto register(RegisterRequestDto request) throws Exception {
        // Kiểm tra email đã tồn tại chưa
        if (userJpaRepository.existsByEmail(request.getEmail())){
            throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST);
        }
        
        
        // Kiểm tra phone number đã tồn tại chưa
        if (userJpaRepository.existsByPhoneNumber(request.getPhoneNumber())){
            throw new HttpException("Phone number already exists", HttpStatus.BAD_REQUEST);
        }

        // Tạo user mới
        User user = new User();
        user.setRoles(new java.util.ArrayList<>());  // Khởi tạo ArrayList
        user.setEmail(request.getEmail());
        user.setUsername(request.getUserName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());

        // Lưu user vào database
        user = this.userJpaRepository.save(user);

        // Gán role "Customers" mặc định
        Role customerRole = roleRepository.findByName("Customers")
                .orElseThrow(() -> new HttpException("Role Customers not found", HttpStatus.INTERNAL_SERVER_ERROR));
        user.getRoles().add(customerRole);
        user = this.userJpaRepository.save(user);

        // Tạo token và return response
        String accessToken = jwtService.generateAccessToken(user);
        return RegisterResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phonenumber(user.getPhoneNumber())
                .accessToken(accessToken)
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .build();
    }


}