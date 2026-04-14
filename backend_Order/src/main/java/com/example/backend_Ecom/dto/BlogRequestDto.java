package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "DTO for blog post request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogRequestDto {

    @NotBlank(message = "Title cannot be empty")
    private String title;

    @NotBlank(message = "Summary cannot be empty")
    private String summary;  // Short description for list page

    @NotBlank(message = "Content cannot be empty")
    private String content;  // Full HTML content for detail page

    @NotBlank(message = "Author cannot be empty")
    private String author;

    @NotBlank(message = "Category cannot be empty")
    private String category;  // Recipes, Tips, News, etc.

    // Upload avatar file
    private MultipartFile avatar;

    // Or use avatar URL directly
    private String avatarUrl;

}
