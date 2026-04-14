package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.FoodCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "DTO for food request (create/update)")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodRequestDto {

    @NotBlank(message = "Food name cannot be empty")
    @Schema(description = "Food name", example = "Cơm gà")
    private String name;

    @Schema(description = "Food description", example = "Cơm gà nướng thơm lừng")
    private String description;

    @Min(value = 1, message = "Price must be greater than 0")
    private Long price;

    @Min(value = 0, message = "Quantity cannot be negative")
    @Schema(description = "Food quantity", example = "50")
    private Integer quantity;

    @Schema(description = "Food image URL")
    private String imageUrl;

    @Schema(description = "Food category", example = "RICE")
    private FoodCategory category;

    @Schema(description = "Is featured/prominent", example = "true")
    private Boolean featured;

    @Builder.Default
    private Unit unit = Unit.ITEM;

    @Schema(description = "Food region", example = "HA_NOI")
    private Region region;

    private MultipartFile image;  // For form-data upload
}
