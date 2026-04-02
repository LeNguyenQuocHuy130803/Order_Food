package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.AddressRequestDto;
import com.example.backend_Ecom.dto.AddressResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users/{userId}/addresses")
public class AddressController {

    private final AddressService addressService;

    /**
     * Get all addresses for user
     * GET /api/users/{userId}/addresses
     * Required: Authentication token
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all addresses for user")
    public ResponseEntity<List<AddressResponseDto>> getAddressesByUserId(
            @Parameter(description = "User ID", example = "1")
            @PathVariable Long userId) {
        return ResponseEntity.ok(addressService.getAddressesByUserId(userId));
    }

    /**
     * Get address by ID
     * GET /api/users/{userId}/addresses/{addressId}
     * Required: Authentication token
     */
    @GetMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get address by ID")
    public ResponseEntity<AddressResponseDto> getAddressById(
            @Parameter(description = "User ID", example = "1")
            @PathVariable Long userId,
            @Parameter(description = "Address ID", example = "1")
            @PathVariable Long addressId) {
        return ResponseEntity.ok(addressService.getAddressById(addressId));
    }

    /**
     * Create new address
     * POST /api/users/{userId}/addresses
     * Required: Authentication token
     * 
     * Body (JSON):
     * {
     *   "type": "HOME",
     *   "address": "123 Đường A, Quận 1, TP.HCM",
     *   "isDefault": true
     * }
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create new address")
    public ResponseEntity<AddressResponseDto> createAddress(
            @Parameter(description = "User ID", example = "1")
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequestDto request) {
        AddressResponseDto response = addressService.createAddress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update address
     * PUT /api/users/{userId}/addresses/{addressId}
     * Required: Authentication token
     */
    @PatchMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update address")
    public ResponseEntity<AddressResponseDto> updateAddress(
            @Parameter(description = "User ID", example = "1")
            @PathVariable Long userId,
            @Parameter(description = "Address ID", example = "1")
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequestDto request) {
        return ResponseEntity.ok(addressService.updateAddress(addressId, request));
    }

    /**
     * Delete address
     * DELETE /api/users/{userId}/addresses/{addressId}
     * Required: Authentication token
     */
    @DeleteMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete address")
    public ResponseEntity<MessageResponseDto> deleteAddress(
            @Parameter(description = "User ID", example = "1")
            @PathVariable Long userId,
            @Parameter(description = "Address ID", example = "1")
            @PathVariable Long addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok(MessageResponseDto.builder()
                .success(true)
                .message("Address deleted successfully")
                .build());
    }
}
