package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.PaginatedProductResponseDto;
import com.example.backend_Ecom.dto.ProductRequestDto;
import com.example.backend_Ecom.dto.ProductResponseDto;
import com.example.backend_Ecom.enums.ProductType;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "Product", description = "Unified product management operations")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Get all products or filter products")
    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllOrFilterProducts(
            @RequestParam(required = false) ProductType category,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Unit unit,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Region region,
            @RequestParam(required = false) String search
    ) {
        if (category != null || featured != null || unit != null || minPrice != null || maxPrice != null || region != null || search != null) {
            return ResponseEntity.ok(productService.filterProducts(category, featured, unit, minPrice, maxPrice, region, search));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @Operation(summary = "Get paginated products")
    @GetMapping("/paging")
    public ResponseEntity<PaginatedProductResponseDto> getProductsPaginated(
            @RequestParam(required = false) ProductType category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productService.getProductsPaginated(category, page, size));
    }

    @Operation(summary = "Get product by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @Operation(summary = "Create new product (Admin only)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponseDto> createProduct(@Valid @ModelAttribute ProductRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @Operation(summary = "Update product (Admin only)")
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id,
            @ModelAttribute ProductRequestDto request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @Operation(summary = "Delete product (Admin only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
