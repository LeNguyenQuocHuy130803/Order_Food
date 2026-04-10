package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.ProductType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Schema(description = "DTO for order item response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDto {

    private Long id;

    private ProductType productType;

    private Long productId;

    private String productName;

    private Long priceAtTime;

    private Integer quantity;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
