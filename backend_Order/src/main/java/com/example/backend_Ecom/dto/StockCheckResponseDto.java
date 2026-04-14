package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.ProductType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.List;

@Schema(description = "DTO for stock check response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockCheckResponseDto {

    @Schema(description = "Whether all items are in stock")
    private Boolean allAvailable;

    @Schema(description = "List of stock status for each item")
    private List<StockStatus> items;

    @Schema(description = "Total items that are out of stock")
    private Integer insufficientItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockStatus {
        @Schema(description = "Product type")
        private ProductType productType;

        @Schema(description = "Product ID")
        private Long productId;

        @Schema(description = "Product name")
        private String productName;

        @Schema(description = "Requested quantity by user")
        private Integer requestedQuantity;

        @Schema(description = "Available quantity in stock")
        private Integer availableQuantity;

        @Schema(description = "Status: IN_STOCK, INSUFFICIENT, OUT_OF_STOCK")
        private StockStatus.Status status;

        @Schema(description = "Message for UI display")
        private String message;

        public enum Status {
            IN_STOCK,
            INSUFFICIENT,
            OUT_OF_STOCK
        }
    }
}
