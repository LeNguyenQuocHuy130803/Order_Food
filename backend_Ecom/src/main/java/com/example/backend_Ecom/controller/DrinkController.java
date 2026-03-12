package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.DrinkRequestDto;
import com.example.backend_Ecom.dto.DrinkResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.enums.Category;
import com.example.backend_Ecom.enums.DrinkType;
import com.example.backend_Ecom.enums.Unit;
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
     * Search - Tìm kiếm sản phẩm theo tên
     * GET /api/drinks/search?name=coffee
     * → Trả về tất cả sản phẩm có tên chứa "coffee"
     */
    @GetMapping("/search")
    public ResponseEntity<List<DrinkResponseDto>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(drinkService.searchByName(name));
    }

    /**
     * Filter - Lọc sản phẩm theo nhiều tiêu chí (tất cả optional)
     * GET /api/drinks/filter?name=coffee&category=DRINK&type=NORMAL&unit=CUP&minPrice=20000&maxPrice=100000
     * 
     * Ví dụ:
     *   /filter?name=coffee → lọc theo tên chứa "coffee"
     *   /filter?category=DRINK → lọc loại DRINK
     *   /filter?minPrice=50000&maxPrice=200000 → lọc theo khoảng giá
     *   /filter → trả về tất cả (không filter)
     */
    @GetMapping("/filter")
    public ResponseEntity<List<DrinkResponseDto>> filterDrinks(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) DrinkType type,
            @RequestParam(required = false) Unit unit,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice) {
        return ResponseEntity.ok(drinkService.filterDrinks(name, category, type, unit, minPrice, maxPrice));
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

