package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.DessertCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "DTO for dessert response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DessertResponseDto {

    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private Integer quantity;

    private String imageUrl;

    private DessertCategory category;

    private Boolean featured;

    private Unit unit;

    private Region region;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
