package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotBlank;



@Schema(description = "DTO for order request (checkout)")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDto {

    @Schema(description = "Address type from saved addresses: HOME, WORK, SCHOOL, OTHER", example = "HOME")
    private String addressType;

    @Schema(description = "Full address string (Require this if you have no saved addresses)", example = "123 Nguyễn Huệ, Quận 1, TP HCM")
    private String address;

    @Schema(description = "Additional notes/instructions", example = "Giao nhanh vào sáng sớm")
    private String notes;
}
