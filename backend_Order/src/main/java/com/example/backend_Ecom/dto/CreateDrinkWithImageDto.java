package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Schema(description = "DTO for drink creation with image file")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDrinkWithImageDto {

    @NotBlank(message = "Drink name cannot be empty")
    @Schema(description = "Drink name", example = "Iced Coffee")
    private String name;

    @Schema(description = "Drink description", example = "Cold brew coffee")
    private String description;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Schema(description = "Drink price", example = "3.99")
    private BigDecimal price;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 0, message = "Quantity cannot be negative")
    @Schema(description = "Stock quantity", example = "100")
    private Integer quantity;

    @Schema(description = "Drink category", example = "Coffee")
    private String category;

    @Schema(description = "Drink image file")
    private MultipartFile image;
}
