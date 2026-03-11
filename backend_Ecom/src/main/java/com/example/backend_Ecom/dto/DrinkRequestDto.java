package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.DrinkType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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
private Long price;

    @Min(value = 0, message = "Quantity cannot be negative")
    @Schema(description = "Drink quantity", example = "10")
    private Integer quantity;

    @Schema(description = "Drink image URL")
    private String imageUrl;

    @Schema(description = "Drink category", example = "Beverages")
    private String category;

    @Builder.Default
    private DrinkType type = DrinkType.NORMAL;

    private MultipartFile image;  // For form-data upload
}
