package com.example.backend_Ecom.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "DTO for paginated fresh product response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedFreshResponseDto {

    @Schema(description = "List of fresh products in the current page")
    private List<FreshResponseDto> data;

    @Schema(description = "Current page number (1-based)", example = "1")
    private int pageNumber;

    @Schema(description = "Number of items per page", example = "10")
    private int pageSize;

    @Schema(description = "Total number of records available", example = "150")
    private long totalRecords;

    @Schema(description = "Total number of pages available", example = "15")
    private int totalPages;

    @Schema(description = "Whether there is a next page available", example = "true")
    private boolean hasNext;

    @Schema(description = "Whether there is a previous page available", example = "false")
    private boolean hasPrevious;
}
