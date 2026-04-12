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

    private String description;

    private String avatar;

    private String author;

    private String category;

    private Integer commentCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
