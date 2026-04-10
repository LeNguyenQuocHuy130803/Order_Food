package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.StockCheckRequestDto;
import com.example.backend_Ecom.dto.StockCheckResponseDto;
import com.example.backend_Ecom.service.ProductStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@Tag(name = "Stock", description = "Product stock availability check")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final ProductStockService productStockService;

    /**
     * POST /api/stocks/check
     * Check real-time stock status for multiple items
     * Frontend gọi trước khi thanh toán để verify hàng còn không
     *
     * Request body example:
     * {
     *   "items": [
     *     {
     *       "productType": "FOOD",
     *       "productId": 1,
     *       "requestedQuantity": 4
     *     },
     *     {
     *       "productType": "DRINK",
     *       "productId": 5,
     *       "requestedQuantity": 2
     *     }
     *   ]
     * }
     *
     * Response example:
     * {
     *   "allAvailable": false,
     *   "insufficientItems": 1,
     *   "items": [
     *     {
     *       "productType": "FOOD",
     *       "productId": 1,
     *       "productName": "Cà chua",
     *       "requestedQuantity": 4,
     *       "availableQuantity": 2,
     *       "status": "INSUFFICIENT",
     *       "message": "⚠️ Chỉ còn 2 cái (bạn muốn 4 cái)"
     *     },
     *     {
     *       "productType": "DRINK",
     *       "productId": 5,
     *       "productName": "Coca",
     *       "requestedQuantity": 2,
     *       "availableQuantity": 10,
     *       "status": "IN_STOCK",
     *       "message": "✅ Có đủ 2 cái"
     *     }
     *   ]
     * }
     */
    @Operation(summary = "Check stock availability for items before checkout")
    @PostMapping("/check")
    public ResponseEntity<StockCheckResponseDto> checkStock(
            @Valid @RequestBody StockCheckRequestDto request) {
        return ResponseEntity.ok(productStockService.checkStockForItems(request));
    }
}
