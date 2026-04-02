package com.example.backend_Ecom.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedDessertResponseDto {
    private List<DessertResponseDto> data;
    private Integer pageNumber;
    private Integer pageSize;
    private Long totalRecords;
    private Integer totalPages;
    private Boolean hasNext;
    private Boolean hasPrevious;
}
