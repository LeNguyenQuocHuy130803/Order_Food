package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.UserResponseDto;
import com.example.backend_Ecom.dto.UserUpdateRequestDto;
import com.example.backend_Ecom.dto.PaginatedUserResponseDto;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.security.UserPrincipal;
import com.example.backend_Ecom.service.UserService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for user management endpoints
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    /**
     * Get all users
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get all users with pagination
     * GET /api/users/paging?page=1&size=10
     *
     * Ví dụ:
     *   /paging → trả về trang đầu tiên (page=1, size=10 mặc định)
     *   /paging?page=1&size=20 → trang 1 với 20 người dùng
     *   /paging?page=2&size=10 → trang 2 với 10 người dùng
     */
    @GetMapping("/paging")
    public ResponseEntity<PaginatedUserResponseDto> getAllUsersPaginated(
            @Parameter(description = "Page number (1-based)", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page", example = "10") @RequestParam(defaultValue = "10") int size) {
        PaginatedUserResponseDto users = userService.getAllUsersPaginated(page, size);
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     * Required: Authentication token
     * Authorization: User can only access their own data or admins can access any user
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById( @PathVariable Long id) {
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Update user information with form-data support for avatar upload
     * PUT /api/users/{id}
     * Required: Authentication token
     * Authorization: User can only update their own data or admins can update any user
     */
    @PatchMapping(value = "/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @ModelAttribute UserUpdateRequestDto request) {
        
        UserResponseDto updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }
}
