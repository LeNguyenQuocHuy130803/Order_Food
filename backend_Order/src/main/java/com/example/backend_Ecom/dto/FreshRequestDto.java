package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.FreshCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

@Schema(description = "DTO for fresh product request (create/update)")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreshRequestDto {

    @NotBlank(message = "Fresh product name cannot be empty")
    @Schema(description = "Fresh product name", example = "Rau cải xanh")
    private String name;

    @Schema(description = "Fresh product description", example = "Rau cải xanh tươi ngon")
    private String description;

    @Min(value = 1, message = "Price must be greater than 0")
    @Schema(description = "Fresh product price", example = "25000")
    private BigDecimal price;

    @Min(value = 0, message = "Quantity cannot be negative")
    @Schema(description = "Fresh product quantity", example = "100")
    private Integer quantity;

    @Schema(description = "Fresh product image URL")
    private String imageUrl;

    @Schema(description = "Fresh product category", example = "VEGETABLE")
    private FreshCategory category;

    @Schema(description = "Is featured/prominent", example = "true")
    private Boolean featured;

    @Builder.Default
    private Unit unit = Unit.ITEM;

    @Schema(description = "Fresh product region", example = "HA_NOI")
    private Region region;

    private MultipartFile image;  // For form-data upload
}
