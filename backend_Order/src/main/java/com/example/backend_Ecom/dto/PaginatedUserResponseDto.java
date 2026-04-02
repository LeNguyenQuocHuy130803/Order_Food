package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Schema(description = "DTO for paginated user response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedUserResponseDto {
    private List<UserResponseDto> data;
    private int pageNumber;
    private int pageSize;
    private long totalRecords;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}
