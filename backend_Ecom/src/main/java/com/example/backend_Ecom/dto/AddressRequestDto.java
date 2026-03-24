package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "DTO for address request (create/update)")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequestDto {
    @Schema(description = "Address type", example = "HOME")
    @NotBlank(message = "Address type cannot be blank")
    private String type;

    @Schema(description = "Full address text", example = "123 Đường A, Quận 1, TP.HCM")
    @NotBlank(message = "Address cannot be blank")
    private String address;

    @Schema(description = "Is this the default address", example = "false")
    @Builder.Default
    private Boolean isDefault = false;
}
