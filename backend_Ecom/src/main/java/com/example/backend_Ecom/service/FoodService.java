package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.FoodRequestDto;
import com.example.backend_Ecom.dto.FoodResponseDto;
import com.example.backend_Ecom.dto.PaginatedFoodResponseDto;
import com.example.backend_Ecom.entity.Food;
import com.example.backend_Ecom.enums.FoodCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.FoodRepository;
import com.example.backend_Ecom.specification.FoodSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class FoodService {

    private final FoodRepository foodRepository;
    private final FileUploadService fileUploadService;

    public FoodResponseDto createFood(FoodRequestDto request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Food name cannot be empty");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Price must be greater than 0");
        }
        if (request.getQuantity() != null && request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity cannot be negative");
        }

        if (foodRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Food name already exists");
        }

        String imageUrl = resolveImage(request, null);

        Food food = Food.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .imageUrl(imageUrl)
                .category(request.getCategory() != null ? request.getCategory() : FoodCategory.RICE)
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .unit(request.getUnit() != null ? request.getUnit() : Unit.ITEM)
                .region(request.getRegion() != null ? request.getRegion() : Region.HA_NOI)
                .build();

        food = foodRepository.save(food);

        return mapToDto(food);
    }

    public FoodResponseDto updateFood(Long id, FoodRequestDto request) {

        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food not found"));

        if (request.getName() != null &&
                !food.getName().equals(request.getName()) &&
                foodRepository.existsByName(request.getName())) {

            throw new AppException(ErrorCode.INVALID_REQUEST, "Food name already exists");
        }

        if (request.getName() != null) food.setName(request.getName());
        if (request.getDescription() != null) food.setDescription(request.getDescription());
        if (request.getPrice() != null) food.setPrice(request.getPrice());
        if (request.getQuantity() != null) food.setQuantity(request.getQuantity());
        if (request.getCategory() != null) food.setCategory(request.getCategory());
        if (request.getFeatured() != null) food.setFeatured(request.getFeatured());
        if (request.getUnit() != null) food.setUnit(request.getUnit());
        if (request.getRegion() != null) food.setRegion(request.getRegion());

        String imageUrl = resolveImage(request, food.getImageUrl());
        if (imageUrl != null) food.setImageUrl(imageUrl);

        food = foodRepository.save(food);

        log.info("✓ Food updated: {}", id);
        return mapToDto(food);
    }

    public void deleteFood(Long id) {

        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food not found"));

        if (food.getImageUrl() != null) {
            fileUploadService.deleteImage(food.getImageUrl());
        }

        foodRepository.delete(food);

        log.info("✓ Food deleted: {}", id);
    }

    public FoodResponseDto getFoodById(Long id) {

        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food not found"));

        return mapToDto(food);
    }

    public PaginatedFoodResponseDto getAllFoodsPaginated(int page, int size) {
        // Convert 1-based page to 0-based for Spring Data
        Pageable pageable = PageRequest.of(page - 1, size);

        // Lấy dữ liệu phân trang từ repository
        Page<Food> foodPage = foodRepository.findAll(pageable);

        // Chuyển đổi Page<Food> thành List<FoodResponseDto>
        List<FoodResponseDto> foodDtos = foodPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Tạo response DTO với thông tin phân trang (convert back to 1-based for response)
        return PaginatedFoodResponseDto.builder()
                .data(foodDtos)
                .pageNumber(foodPage.getNumber() + 1)  // Convert back to 1-based
                .pageSize(foodPage.getSize())
                .totalRecords(foodPage.getTotalElements())
                .totalPages(foodPage.getTotalPages())
                .hasNext(foodPage.hasNext())
                .hasPrevious(foodPage.hasPrevious())
                .build();
    }

    public List<FoodResponseDto> advancedSearch(String name, String description, FoodCategory category, Region region) {
        log.info("Advanced search - name: {}, description: {}, category: {}, region: {}", name, description, category, region);
        return foodRepository.findAll(FoodSpecification.advancedSearchCriteria(name, description, category, region))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<FoodResponseDto> filterFoods(List<FoodCategory> categories, Boolean featured, 
                                             Unit unit, Long minPrice, Long maxPrice, Region region) {
        log.info("Filtering foods - categories: {}, featured: {}, unit: {}, price: {} - {}, region: {}", 
                  categories, featured, unit, minPrice, maxPrice, region);
        
        return foodRepository.findAll(FoodSpecification.filterByCriteria(categories, featured, unit, minPrice, maxPrice, region))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private String resolveImage(FoodRequestDto request, String currentImage) {

        if (request.getImage() != null && !request.getImage().isEmpty()) {

            if (currentImage != null) {
                fileUploadService.deleteImage(currentImage);
            }

            return fileUploadService.uploadImage(request.getImage());
        }

        if (request.getImageUrl() != null) {
            return request.getImageUrl();
        }

        return currentImage;
    }

    private FoodResponseDto mapToDto(Food food) {

        return FoodResponseDto.builder()
                .id(food.getId())
                .name(food.getName())
                .description(food.getDescription())
                .price(food.getPrice())
                .quantity(food.getQuantity())
                .imageUrl(food.getImageUrl())
                .category(food.getCategory())
                .featured(food.getFeatured())
                .unit(food.getUnit())
                .region(food.getRegion())
                .createdAt(food.getCreatedAt())
                .updatedAt(food.getUpdatedAt())
                .build();
    }
}
