package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.StockCheckRequestDto;
import com.example.backend_Ecom.dto.StockCheckResponseDto;
import com.example.backend_Ecom.entity.*;
import com.example.backend_Ecom.enums.ProductType;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProductStockService {

    private final ProductRepository productRepository;

    /**
     * Check stock cho multiple items (Real-time)
     * Frontend sẽ gọi trước khi checkout để verify stock
     */
    public StockCheckResponseDto checkStockForItems(StockCheckRequestDto request) {
        List<StockCheckResponseDto.StockStatus> stockStatuses = new ArrayList<>();
        int insufficientCount = 0;

        for (StockCheckRequestDto.StockCheckItem item : request.getItems()) {
            StockCheckResponseDto.StockStatus status = checkSingleProduct(
                item.getProductType(),
                item.getProductId(),
                item.getRequestedQuantity()
            );
            stockStatuses.add(status);

            if (status.getStatus() != StockCheckResponseDto.StockStatus.Status.IN_STOCK) {
                insufficientCount++;
            }
        }

        boolean allAvailable = insufficientCount == 0;

        log.info("Stock check: {} items total, {} insufficient", 
            request.getItems().size(), insufficientCount);

        return StockCheckResponseDto.builder()
                .allAvailable(allAvailable)
                .items(stockStatuses)
                .insufficientItems(insufficientCount)
                .build();
    }

    /**
     * Check stock cho 1 sản phẩm duy nhất từ ProductRepository
     */
    private StockCheckResponseDto.StockStatus checkSingleProduct(
            ProductType productType, Long productId, Integer requestedQuantity) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Product not found with ID: " + productId));

        return buildStockStatus(productType, productId, product.getName(), requestedQuantity, product.getQuantity());
    }

    /**
     * Build stock status based on availability
     */
    private StockCheckResponseDto.StockStatus buildStockStatus(
            ProductType productType, Long productId, String productName,
            Integer requestedQuantity, Integer availableQuantity) {

        StockCheckResponseDto.StockStatus.Status status;
        String message;

        if (availableQuantity >= requestedQuantity) {
            status = StockCheckResponseDto.StockStatus.Status.IN_STOCK;
            message = "✅ Có đủ " + requestedQuantity + " cái";
        } else if (availableQuantity > 0) {
            status = StockCheckResponseDto.StockStatus.Status.INSUFFICIENT;
            message = "⚠️ Chỉ còn " + availableQuantity + " cái (bạn muốn " + requestedQuantity + " cái)";
        } else {
            status = StockCheckResponseDto.StockStatus.Status.OUT_OF_STOCK;
            message = "❌ Hết hàng";
        }

        return StockCheckResponseDto.StockStatus.builder()
                .productType(productType)
                .productId(productId)
                .productName(productName)
                .requestedQuantity(requestedQuantity)
                .availableQuantity(availableQuantity)
                .status(status)
                .message(message)
                .build();
    }
}
