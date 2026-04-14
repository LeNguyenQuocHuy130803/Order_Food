package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Schema(description = "DTO for blog post response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogResponseDto {

    private Long id;

    private String title;

    private String summary;  // Short description for list page

    private String content;  // Full HTML content for detail page

    private String avatar;

    private String author;

    private String category;


    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
