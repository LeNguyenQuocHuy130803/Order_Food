package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.FoodCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Schema(description = "DTO for food response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodResponseDto {

    private Long id;

    private String name;

    private String description;

    private Long price;

    private Integer quantity;

    private String imageUrl;

    private FoodCategory category;

    private Boolean featured;

    private Unit unit;

    private Region region;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
