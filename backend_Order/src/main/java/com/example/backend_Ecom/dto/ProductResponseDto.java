package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.ProductType;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private String imageUrl;
    private ProductType category;
    private Boolean featured;
    private Unit unit;
    private Region region;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
