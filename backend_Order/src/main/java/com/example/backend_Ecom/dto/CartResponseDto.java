package com.example.backend_Ecom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "DTO for cart response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDto {

    private Long id;

    private Long userId;

    private Long totalPrice;

    private List<CartItemResponseDto> items;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
