package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.DessertRequestDto;
import com.example.backend_Ecom.dto.DessertResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.dto.PaginatedDessertResponseDto;
import com.example.backend_Ecom.enums.DessertCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.service.DessertService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/desserts")
public class DessertController {

    private final DessertService dessertService;

    /**
     * Get All Desserts with Pagination
     * GET /api/desserts/paging?page=1&size=10
     *
     * Ví dụ:
     *   /paging → trả về trang đầu tiên (page=1, size=10 mặc định)
     *   /paging?page=1&size=20 → trang 1 với 20 sản phẩm
     *   /paging?page=2&size=10 → trang 2 với 10 sản phẩm
     */
    @GetMapping("/paging")
    public PaginatedDessertResponseDto getAllDessertsPaginated(
            @Parameter(description = "Page number (1-based)", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page", example = "10") @RequestParam(defaultValue = "10") int size) {
        return dessertService.getAllDessertsPaginated(page, size);
    }

    /**
     * Filter - Lọc sản phẩm theo nhiều tiêu chí (tất cả optional)
     * GET /api/desserts/filter?categories=CAKE&featured=true&unit=CUP&minPrice=50000&maxPrice=200000&region=HA_NOI
     * 
     * Ví dụ:
     *   /filter?categories=CAKE → lọc loại CAKE
     *   /filter?categories=CAKE&categories=COOKIE → lọc CAKE hoặc COOKIE
     *   /filter?featured=true → chỉ lọc sản phẩm nổi bật
     *   /filter?minPrice=50000&maxPrice=200000 → lọc theo khoảng giá
     *   /filter?region=HA_NOI → lọc sản phẩm ở Hà Nội
     *   /filter → trả về tất cả (không filter)
     */
    @GetMapping("/filter")
    public ResponseEntity<List<DessertResponseDto>> filterDesserts(
            @RequestParam(required = false) List<DessertCategory> categories,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Unit unit,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Region region) {
        
        // Validate price range
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                "minPrice (" + minPrice + ") cannot be greater than maxPrice (" + maxPrice + ")");
        }
        
        return ResponseEntity.ok(dessertService.filterDesserts(categories, featured, unit, minPrice, maxPrice, region));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DessertResponseDto> getDessertById(@PathVariable Long id) {
        return ResponseEntity.ok(dessertService.getDessertById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DessertResponseDto> createDessert(@Valid @ModelAttribute DessertRequestDto request) {
        return ResponseEntity.ok(dessertService.createDessert(request));
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DessertResponseDto> updateDessert(@PathVariable Long id, @Valid @ModelAttribute DessertRequestDto request) {
        return ResponseEntity.ok(dessertService.updateDessert(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponseDto> deleteDessert(@PathVariable Long id) {
        dessertService.deleteDessert(id);
        return ResponseEntity.ok(MessageResponseDto.builder()
                .success(true)
                .message("Dessert deleted successfully")
                .build());
    }
}
