package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.DrinkRequestDto;
import com.example.backend_Ecom.dto.DrinkResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.dto.PaginatedDrinkResponseDto;
import com.example.backend_Ecom.enums.DrinkCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.service.DrinkService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/drinks")
public class DrinkController {

    private final DrinkService drinkService;

    /**
     * Get All Drinks with Pagination
     * GET /api/drinks/paging?page=1&size=10
     *
     * Ví dụ:
     *   /paging → trả về trang đầu tiên (page=1, size=10 mặc định)
     *   /paging?page=1&size=20 → trang 1 với 20 sản phẩm
     *   /paging?page=2&size=10 → trang 2 với 10 sản phẩm
     */
    @GetMapping("/paging")
    public PaginatedDrinkResponseDto getAllDrinksPaginated(
            @Parameter(description = "Page number (1-based)", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page", example = "10") @RequestParam(defaultValue = "10") int size) {
        System.out.println("page: " + page);
        System.out.println("size: " + size);
        return drinkService.getAllDrinksPaginated(page, size);
    }

    /**
     * Filter - Lọc sản phẩm theo nhiều tiêu chí (tất cả optional)
     * GET /api/drinks/filter?categories=COFFEE&featured=true&unit=CUP&minPrice=20000&maxPrice=100000&region=HA_NOI
     * 
     * Ví dụ:
     *   /filter?categories=COFFEE → lọc loại COFFEE
     *   /filter?categories=COFFEE&categories=TEA → lọc COFFEE hoặc TEA
     *   /filter?featured=true → chỉ lọc sản phẩm nổi bật
     *   /filter?minPrice=50000&maxPrice=200000 → lọc theo khoảng giá
     *   /filter?region=HA_NOI → lọc sản phẩm ở Hà Nội
     *   /filter → trả về tất cả (không filter)
     */
    @GetMapping("/filter")
    public ResponseEntity<List<DrinkResponseDto>> filterDrinks(
            @RequestParam(required = false) List<DrinkCategory> categories,
            @RequestParam(required = false) Boolean featured,   // nó nó theo tiêu chí lọc có thể người dùng chỉ chọn là categories = TEA và region = HA_NOI thì cái này trống
            @RequestParam(required = false) Unit unit,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Region region) {
        
        // Validate price range
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                "minPrice (" + minPrice + ") cannot be greater than maxPrice (" + maxPrice + ")");
        }
        
        return ResponseEntity.ok(drinkService.filterDrinks(categories, featured, unit, minPrice, maxPrice, region));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DrinkResponseDto> getDrinkById(@PathVariable Long id) {
        return ResponseEntity.ok(drinkService.getDrinkById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DrinkResponseDto> createDrink(@Valid @ModelAttribute DrinkRequestDto request) {
        return ResponseEntity.ok(drinkService.createDrink(request));
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DrinkResponseDto> updateDrink(@PathVariable Long id, @Valid @ModelAttribute DrinkRequestDto request) {
        return ResponseEntity.ok(drinkService.updateDrink(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponseDto> deleteDrink(@PathVariable Long id) {
        drinkService.deleteDrink(id);
        return ResponseEntity.ok(MessageResponseDto.builder()
                .success(true)
                .message("Drink deleted successfully")
                .build());
    }
}

