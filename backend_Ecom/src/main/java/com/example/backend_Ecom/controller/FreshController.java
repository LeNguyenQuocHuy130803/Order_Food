package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.FreshRequestDto;
import com.example.backend_Ecom.dto.FreshResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.dto.PaginatedFreshResponseDto;
import com.example.backend_Ecom.enums.FreshCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.service.FreshService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/freshs")
public class FreshController {

    private final FreshService freshService;

    /**
     * Get All Fresh Products with Pagination
     * GET /api/fresh/paging?page=1&size=10
     *
     * Ví dụ:
     *   /paging → trả về trang đầu tiên (page=1, size=10 mặc định)
     *   /paging?page=1&size=20 → trang 1 với 20 sản phẩm
     *   /paging?page=2&size=10 → trang 2 với 10 sản phẩm
     */
    @GetMapping("/paging")
    public PaginatedFreshResponseDto getAllFreshProductsPaginated(
            @Parameter(description = "Page number (1-based)", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page", example = "10") @RequestParam(defaultValue = "10") int size) {
        System.out.println("page: " + page);
        System.out.println("size: " + size);
        return freshService.getAllFreshProductsPaginated(page, size);
    }

    /**
     * Advanced Search - Tìm kiếm nâng cao theo tên, description, category, region
     * GET /api/fresh/search?name=rau&description=cải&category=VEGETABLE&region=HA_NOI
     * 
     * Ví dụ:
     *   /search?name=rau → tìm tên chứa "rau"
     *   /search?description=xanh → tìm description chứa "xanh"
     *   /search?category=VEGETABLE → tìm category VEGETABLE
     *   /search?region=HA_NOI → tìm sản phẩm ở Hà Nội
     *   /search?name=rau&region=HA_NOI → kết hợp tên + khu vực
     */
    @GetMapping("/search")
    public ResponseEntity<List<FreshResponseDto>> advancedSearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) FreshCategory category,
            @RequestParam(required = false) Region region) {
        return ResponseEntity.ok(freshService.advancedSearch(name, description, category, region));
    }

    /**
     * Filter - Lọc sản phẩm theo nhiều tiêu chí (tất cả optional)
     * GET /api/fresh/filter?categories=VEGETABLE&featured=true&unit=KG&minPrice=10000&maxPrice=100000&region=HA_NOI
     * 
     * Ví dụ:
     *   /filter?categories=VEGETABLE → lọc loại VEGETABLE
     *   /filter?categories=VEGETABLE&categories=FRUIT → lọc VEGETABLE hoặc FRUIT
     *   /filter?featured=true → chỉ lọc sản phẩm nổi bật
     *   /filter?minPrice=10000&maxPrice=100000 → lọc theo khoảng giá
     *   /filter?region=HA_NOI → lọc sản phẩm ở Hà Nội
     *   /filter → trả về tất cả (không filter)
     */
    @GetMapping("/filter")
    public ResponseEntity<List<FreshResponseDto>> filterFreshProducts(
            @RequestParam(required = false) List<FreshCategory> categories,
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
        
        return ResponseEntity.ok(freshService.filterFreshProducts(categories, featured, unit, minPrice, maxPrice, region));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FreshResponseDto> getFreshById(@PathVariable Long id) {
        return ResponseEntity.ok(freshService.getFreshById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FreshResponseDto> createFresh(@Valid @ModelAttribute FreshRequestDto request) {
        return ResponseEntity.ok(freshService.createFresh(request));
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FreshResponseDto> updateFresh(@PathVariable Long id, @Valid @ModelAttribute FreshRequestDto request) {
        return ResponseEntity.ok(freshService.updateFresh(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponseDto> deleteFresh(@PathVariable Long id) {
        freshService.deleteFresh(id);
        return ResponseEntity.ok(MessageResponseDto.builder()
                .success(true)
                .message("Fresh product deleted successfully")
                .build());
    }
}
