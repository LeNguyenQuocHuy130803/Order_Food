package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.List;

@Schema(description = "DTO for paginated order response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedOrderResponseDto {

    @Schema(description = "List of orders")
    private List<OrderResponseDto> data;

    @Schema(description = "Current page number (1-based)")
    private int pageNumber;

    @Schema(description = "Number of items per page")
    private int pageSize;

    @Schema(description = "Total number of records")
    private long totalRecords;

    @Schema(description = "Total number of pages")
    private int totalPages;

    @Schema(description = "Whether there is a next page")
    private boolean hasNext;

    @Schema(description = "Whether there is a previous page")
    private boolean hasPrevious;
}
