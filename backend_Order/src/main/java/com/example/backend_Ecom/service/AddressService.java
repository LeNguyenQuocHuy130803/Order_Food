package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.AddressRequestDto;
import com.example.backend_Ecom.dto.AddressResponseDto;
import com.example.backend_Ecom.entity.Address;
import com.example.backend_Ecom.entity.User;
import com.example.backend_Ecom.enums.AddressType;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.AddressRepository;
import com.example.backend_Ecom.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserJpaRepository userJpaRepository;

    /**
     * Create new address for user
     */
    public AddressResponseDto createAddress(Long userId, AddressRequestDto request) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + userId));

        // Validate address type
        AddressType addressType;
        try {
            addressType = AddressType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            String validTypes = String.join(", ", 
                java.util.Arrays.stream(AddressType.values()).map(Enum::name).toArray(String[]::new));
            throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid address type. Must be one of: " + validTypes);
        }

        // If this is default, unset other defaults
        if (request.getIsDefault() != null && request.getIsDefault()) {
            addressRepository.findByUserId(userId).forEach(addr -> {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            });
        }

        Address address = Address.builder()
                .user(user)
                .type(addressType)
                .address(request.getAddress())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        address = addressRepository.save(address);
        log.info("✓ Address created for user: {}", userId);
        return mapToDto(address);
    }

    /**
     * Get all addresses for user
     */
    public List<AddressResponseDto> getAddressesByUserId(Long userId) {
        // Verify user exists
        if (!userJpaRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + userId);
        }

        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get address by ID
     */
    public AddressResponseDto getAddressById(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Address not found with ID: " + addressId));
        return mapToDto(address);
    }

    /**
     * Update address
     */
    public AddressResponseDto updateAddress(Long addressId, AddressRequestDto request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Address not found with ID: " + addressId));

        // Validate and update address type
        if (request.getType() != null && !request.getType().isBlank()) {
            try {
                address.setType(AddressType.valueOf(request.getType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid address type");
            }
        }

        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            address.setAddress(request.getAddress());
        }

        // If setting as default, unset other defaults
        if (request.getIsDefault() != null && request.getIsDefault()) {
            addressRepository.findByUserId(address.getUser().getId()).forEach(addr -> {
                if (!addr.getId().equals(addressId)) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            });
            address.setIsDefault(true);
        } else if (request.getIsDefault() != null && !request.getIsDefault()) {
            address.setIsDefault(false);
        }

        address = addressRepository.save(address);
        log.info("✓ Address updated: {}", addressId);
        return mapToDto(address);
    }

    /**
     * Delete address
     */
    public void deleteAddress(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Address not found with ID: " + addressId));

        addressRepository.delete(address);
        log.info("✓ Address deleted: {}", addressId);
    }

    /**
     * Convert Address entity to DTO
     */
    private AddressResponseDto mapToDto(Address address) {
        return AddressResponseDto.builder()
                .id(address.getId())
                .type(address.getType())
                .address(address.getAddress())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
