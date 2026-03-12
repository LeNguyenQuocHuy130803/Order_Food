package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.DrinkRequestDto;
import com.example.backend_Ecom.dto.DrinkResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.enums.Category;
import com.example.backend_Ecom.enums.DrinkType;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.service.DrinkService;
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

    @GetMapping
    public ResponseEntity<List<DrinkResponseDto>> getAllDrinks() {
        return ResponseEntity.ok(drinkService.getAllDrinks());
    }

    /**
     * Advanced Search - Tìm kiếm nâng cao theo tên, description, category, region
     * GET /api/drinks/search?name=coffee&description=black&category=COFFEE&region=HANOI
     * 
     * Ví dụ:
     *   /search?name=coffee → tìm tên chứa "coffee"
     *   /search?description=black → tìm description chứa "black"
     *   /search?category=COFFEE → tìm category COFFEE
     *   /search?region=HANOI → tìm sản phẩm ở Hà Nội
     *   /search?name=coffee&region=HANOI → kết hợp tên + khu vực
     */
    @GetMapping("/search")
    public ResponseEntity<List<DrinkResponseDto>> advancedSearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Region region) {
        return ResponseEntity.ok(drinkService.advancedSearch(name, description, category, region));
    }

    /**
     * Filter - Lọc sản phẩm theo nhiều tiêu chí (tất cả optional)
     * GET /api/drinks/filter?category=COFFEE&featured=true&unit=CUP&minPrice=20000&maxPrice=100000&region=HANOI
     * 
     * Ví dụ:
     *   /filter?category=COFFEE → lọc loại COFFEE
     *   /filter?featured=true → chỉ lọc sản phẩm nổi bật
     *   /filter?minPrice=50000&maxPrice=200000 → lọc theo khoảng giá
     *   /filter?region=HANOI → lọc sản phẩm ở Hà Nội
     *   /filter → trả về tất cả (không filter)
     */
    @GetMapping("/filter")
    public ResponseEntity<List<DrinkResponseDto>> filterDrinks(
            @RequestParam(required = false) Category category,
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
        
        return ResponseEntity.ok(drinkService.filterDrinks(category, featured, unit, minPrice, maxPrice, region));
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

