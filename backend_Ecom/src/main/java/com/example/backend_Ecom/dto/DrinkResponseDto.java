package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.DrinkType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Schema(description = "DTO for drink response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrinkResponseDto {

    private Long id;

    private String name;

    private String description;

    private Long price;

    private Integer quantity;

    private String imageUrl;

    private String category;

    private DrinkType type;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
