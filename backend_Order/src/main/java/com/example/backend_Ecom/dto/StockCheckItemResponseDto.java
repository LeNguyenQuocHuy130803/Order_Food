package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.ProductType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "Individual item stock check response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockCheckItemResponseDto {

    @Schema(description = "Product type", example = "FOOD")
    private ProductType productType;

    @Schema(description = "Product ID", example = "1")
    private Long productId;

    @Schema(description = "Product name", example = "Cơm gà")
    private String productName;

    @Schema(description = "Quantity requested by user", example = "5")
    private Integer requestedQuantity;

    @Schema(description = "Quantity available in stock", example = "2")
    private Integer availableQuantity;

    @Schema(description = "Stock status: IN_STOCK, INSUFFICIENT, OUT_OF_STOCK", example = "INSUFFICIENT")
    private String status;

    @Schema(description = "Status message for UI", example = "⚠️ Chỉ còn 2 cái (bạn muốn 5 cái)")
    private String message;
}
