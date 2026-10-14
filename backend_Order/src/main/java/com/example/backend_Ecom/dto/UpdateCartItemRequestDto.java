package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO for updating cart item request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCartItemRequestDto {

    @Schema(description = "New quantity for the cart item", example = "2")
    @NotNull(message = "Quantity cannot be null")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;
}
