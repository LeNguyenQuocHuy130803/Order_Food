package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;

@Schema(description = "DTO for order request (checkout)")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDto {

    @Schema(description = "Address type from saved addresses: HOME, WORK, SCHOOL, OTHER", example = "HOME")
    private String addressType;

    @Schema(description = "Full address string (required if addressType not provided)", example = "123 Nguyễn Huệ, Quận 1, TP HCM")
    private String address;

    @Schema(description = "Additional notes/instructions", example = "Giao nhanh vào sáng sớm")
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    /**
     * Validation: Either addressType or address must be provided
     */
    @AssertTrue(message = "Either addressType or address must be provided")
    private boolean isAddressValid() {
        return (addressType != null && !addressType.trim().isEmpty()) || 
               (address != null && !address.trim().isEmpty());
    }
}
