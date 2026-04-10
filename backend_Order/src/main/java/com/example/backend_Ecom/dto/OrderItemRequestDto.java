package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.ProductType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Schema(description = "DTO for order item request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequestDto {

    @NotNull(message = "Product type cannot be null")
    private ProductType productType;

    @NotNull(message = "Product ID cannot be null")
    @Positive(message = "Product ID must be positive")
    private Long productId;

    @NotNull(message = "Quantity cannot be null")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;
}
