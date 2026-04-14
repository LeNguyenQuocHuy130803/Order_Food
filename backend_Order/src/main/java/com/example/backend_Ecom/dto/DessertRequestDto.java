package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.DessertCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "DTO for dessert request (create/update)")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DessertRequestDto {

    @Schema(description = "Dessert name", example = "Chocolate Cake")
    // @NotBlank(message = "Dessert name cannot be blank")
    private String name;

    @Schema(description = "Dessert description", example = "Rich chocolate cake with cream topping")
    private String description;

    @Schema(description = "Dessert price", example = "50000")
    @Min(value = 1, message = "Price must be greater than 0")
    private Long price;

    @Schema(description = "Dessert quantity in stock", example = "50")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @Schema(description = "Dessert category", example = "CAKE")
    private DessertCategory category;

    @Schema(description = "Is featured product", example = "true")
    private Boolean featured;

    @Schema(description = "Dessert unit", example = "ITEM")
    @Builder.Default
    private Unit unit = Unit.ITEM;

    @Schema(description = "Dessert region", example = "HA_NOI")
    private Region region;

    private MultipartFile image;  // For form-data upload
    
    private String imageUrl;      // For direct URL
}
