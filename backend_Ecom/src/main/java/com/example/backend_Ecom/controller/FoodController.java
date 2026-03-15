package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.FoodRequestDto;
import com.example.backend_Ecom.dto.FoodResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.dto.PaginatedFoodResponseDto;
import com.example.backend_Ecom.enums.FoodCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.service.FoodService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService foodService;

    /**
     * Get All Foods with Pagination
     * GET /api/foods/paging?page=1&size=10
     *
     * Ví dụ:
     *   /paging → trả về trang đầu tiên (page=1, size=10 mặc định)
     *   /paging?page=1&size=20 → trang 1 với 20 sản phẩm
     *   /paging?page=2&size=10 → trang 2 với 10 sản phẩm
     */
    @GetMapping("/paging")
    public PaginatedFoodResponseDto getAllFoodsPaginated(
            @Parameter(description = "Page number (1-based)", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page", example = "10") @RequestParam(defaultValue = "10") int size) {
        System.out.println("page: " + page);
        System.out.println("size: " + size);
        return foodService.getAllFoodsPaginated(page, size);
    }

    /**
     * Advanced Search - Tìm kiếm nâng cao theo tên, description, category, region
     * GET /api/foods/search?name=cơm&description=gà&category=RICE&region=HA_NOI
     * 
     * Ví dụ:
     *   /search?name=cơm → tìm tên chứa "cơm"
     *   /search?description=gà → tìm description chứa "gà"
     *   /search?category=RICE → tìm category RICE
     *   /search?region=HA_NOI → tìm sản phẩm ở Hà Nội
     *   /search?name=cơm&region=HA_NOI → kết hợp tên + khu vực
     */
    @GetMapping("/search")
    public ResponseEntity<List<FoodResponseDto>> advancedSearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) FoodCategory category,
            @RequestParam(required = false) Region region) {
        return ResponseEntity.ok(foodService.advancedSearch(name, description, category, region));
    }

    /**
     * Filter - Lọc sản phẩm theo nhiều tiêu chí (tất cả optional)
     * GET /api/foods/filter?categories=RICE&featured=true&unit=CUP&minPrice=50000&maxPrice=200000&region=HA_NOI
     * 
     * Ví dụ:
     *   /filter?categories=RICE → lọc loại RICE
     *   /filter?categories=RICE&categories=NOODLE → lọc RICE hoặc NOODLE
     *   /filter?featured=true → chỉ lọc sản phẩm nổi bật
     *   /filter?minPrice=50000&maxPrice=200000 → lọc theo khoảng giá
     *   /filter?region=HA_NOI → lọc sản phẩm ở Hà Nội
     *   /filter → trả về tất cả (không filter)
     */
    @GetMapping("/filter")
    public ResponseEntity<List<FoodResponseDto>> filterFoods(
            @RequestParam(required = false) List<FoodCategory> categories,
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
        
        return ResponseEntity.ok(foodService.filterFoods(categories, featured, unit, minPrice, maxPrice, region));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodResponseDto> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FoodResponseDto> createFood(@Valid @ModelAttribute FoodRequestDto request) {
        return ResponseEntity.ok(foodService.createFood(request));
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FoodResponseDto> updateFood(@PathVariable Long id, @Valid @ModelAttribute FoodRequestDto request) {
        return ResponseEntity.ok(foodService.updateFood(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponseDto> deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        return ResponseEntity.ok(MessageResponseDto.builder()
                .success(true)
                .message("Food deleted successfully")
                .build());
    }
}
