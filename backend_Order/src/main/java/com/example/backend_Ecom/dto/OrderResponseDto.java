package com.example.backend_Ecom.dto;

import com.example.backend_Ecom.enums.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "DTO for order response")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {

    private Long id;

    private Long userId;

    private BigDecimal totalPrice;

    private OrderStatus status;

    private String address;

    private String notes;

    private List<OrderItemResponseDto> items;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
