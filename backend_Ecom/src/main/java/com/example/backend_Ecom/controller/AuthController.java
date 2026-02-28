package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.LoginRequestDto;
import com.example.backend_Ecom.dto.LoginResponseDto;
import com.example.backend_Ecom.dto.RegisterRequestDto;
import com.example.backend_Ecom.dto.RegisterResponseDto;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import com.example.backend_Ecom.service.UserService;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // muốn hiện được các anotation này : như @NotBlank hoặc @Pattern ... thì phải có @Valid ở file controller và nếu chỉ có thể thì khi test ở postman nó sẽ trả về 
    //  dữ liệu chưa được định dạngg kiểu dài dòng nên cần phải cấu hình ở file GlobalExceptionHandler khi nó tra về 400 thì in ra lỗi chi tiết hơn để dễ debug hơn

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) throws Exception {
        LoginResponseDto result = this.userService.login(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto request) throws Exception {
        RegisterResponseDto result = this.userService.register(request);
        return ResponseEntity.ok(result);
    }
    
}
