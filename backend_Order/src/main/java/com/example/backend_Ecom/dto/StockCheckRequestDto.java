package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.ProductType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

@Schema(description = "DTO for stock check request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockCheckRequestDto {

    @NotNull(message = "Items cannot be null")
    @Schema(description = "List of items to check stock")
    private List<StockCheckItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockCheckItem {
        @NotNull(message = "Product type cannot be null")
        private ProductType productType;

        @NotNull(message = "Product ID cannot be null")
        @Positive(message = "Product ID must be positive")
        private Long productId;

        @NotNull(message = "Requested quantity cannot be null")
        @Positive(message = "Requested quantity must be greater than 0")
        private Integer requestedQuantity;
    }
}
