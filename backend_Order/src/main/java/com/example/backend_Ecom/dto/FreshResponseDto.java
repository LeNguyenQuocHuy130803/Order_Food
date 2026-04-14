package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.FreshCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Schema(description = "DTO for fresh product response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreshResponseDto {

    private Long id;

    private String name;

    private String description;

    private Long price;

    private Integer quantity;

    private String imageUrl;

    private FreshCategory category;

    private Boolean featured;

    private Unit unit;

    private Region region;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
