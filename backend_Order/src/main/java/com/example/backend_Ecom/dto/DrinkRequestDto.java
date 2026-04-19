package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.DrinkCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

@Schema(description = "DTO for drink request (create/update)")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrinkRequestDto {

    @NotBlank(message = "Drink name cannot be empty")
    @Schema(description = "Drink name", example = "Iced Coffee")
    private String name;

    @Schema(description = "Drink description", example = "A refreshing iced coffee")
    private String description;

    @Min(value = 1, message = "Price must be greater than 0")
    @Schema(description = "Drink price", example = "30000")
    private BigDecimal price;

    @Min(value = 0, message = "Quantity cannot be negative")
    @Schema(description = "Drink quantity", example = "10")
    private Integer quantity;

    @Schema(description = "Drink image URL")
    private String imageUrl;

    @Schema(description = "Drink category", example = "COFFEE")
    private DrinkCategory category;

    @Schema(description = "Is featured/prominent", example = "true")
    private Boolean featured;

    @Builder.Default
    private Unit unit = Unit.ITEM;

    @Schema(description = "Drink region", example = "HA_NOI")
    private Region region;

    private MultipartFile image;  // For form-data upload
}
