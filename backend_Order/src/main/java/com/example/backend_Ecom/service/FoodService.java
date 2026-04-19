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
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class FoodService {

    private final FoodRepository foodRepository;
    private final FileUploadService fileUploadService;



    @Transactional
    public FoodResponseDto createFood(FoodRequestDto request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Food name cannot be empty");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Price must be greater than 0");
        }
        if (request.getQuantity() != null && request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity cannot be negative");
        }

        if (foodRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Food name already exists");
        }

        String uploadedImageUrl = null;
        try {
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                uploadedImageUrl = fileUploadService.uploadImage(request.getImage());
            } else if (request.getImageUrl() != null) {
                uploadedImageUrl = request.getImageUrl();
            }

            Food food = Food.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .price(request.getPrice())
                    .quantity(request.getQuantity())
                    .imageUrl(uploadedImageUrl)
                    .category(request.getCategory() != null ? request.getCategory() : FoodCategory.RICE)
                    .featured(request.getFeatured() != null ? request.getFeatured() : false)
                    .unit(request.getUnit() != null ? request.getUnit() : Unit.ITEM)
                    .region(request.getRegion() != null ? request.getRegion() : Region.HA_NOI)
                    .build();

            food = foodRepository.save(food);
            return mapToDto(food);

        } catch (Exception e) {
            // COMPENSATING TRANSACTION: Xóa ảnh mồ côi nếu DB lưu lỗi
            if (uploadedImageUrl != null && request.getImage() != null && !request.getImage().isEmpty()) {
                try {
                    fileUploadService.deleteImage(uploadedImageUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete orphaned image: {}", uploadedImageUrl);
                }
            }
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to create food: " + e.getMessage());
        }
    }

    @Transactional
    public FoodResponseDto updateFood(Long id, FoodRequestDto request) {

        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food not found"));

        if (request.getName() != null &&
                !food.getName().equals(request.getName()) &&
                foodRepository.existsByName(request.getName())) {

            throw new AppException(ErrorCode.INVALID_REQUEST, "Food name already exists");
        }

        String oldImageUrl = food.getImageUrl();
        String newlyUploadedUrl = null;

        try {
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                newlyUploadedUrl = fileUploadService.uploadImage(request.getImage());
                food.setImageUrl(newlyUploadedUrl);
            } else if (request.getImageUrl() != null) {
                food.setImageUrl(request.getImageUrl());
            }

            if (request.getName() != null) food.setName(request.getName());
            if (request.getDescription() != null) food.setDescription(request.getDescription());
            if (request.getPrice() != null) food.setPrice(request.getPrice());
            if (request.getQuantity() != null) food.setQuantity(request.getQuantity());
            if (request.getCategory() != null) food.setCategory(request.getCategory());
            if (request.getFeatured() != null) food.setFeatured(request.getFeatured());
            if (request.getUnit() != null) food.setUnit(request.getUnit());
            if (request.getRegion() != null) food.setRegion(request.getRegion());

            food = foodRepository.save(food);

            // CHỈ XOÁ ẢNH CŨ KHI SAVE THÀNH CÔNG
            if (newlyUploadedUrl != null && oldImageUrl != null && !oldImageUrl.isEmpty()) {
                try {
                    fileUploadService.deleteImage(oldImageUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete old image: {}", oldImageUrl);
                }
            }

            log.info("✓ Food updated: {}", id);
            return mapToDto(food);

        } catch (Exception e) {
            // COMPENSATING TRANSACTION: Xoá ảnh mới tải lên nếu update DB thất bại
            if (newlyUploadedUrl != null) {
                try {
                    fileUploadService.deleteImage(newlyUploadedUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete orphaned new image: {}", newlyUploadedUrl);
                }
            }
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to update food: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteFood(Long id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food not found"));

        foodRepository.delete(food);
        foodRepository.flush();

        // Chỉ sau khi DB commit xong, mới xóa ảnh Cloudinary (an toàn tuyệt đối!)
        if (food.getImageUrl() != null) {
            try {
                fileUploadService.deleteImage(food.getImageUrl());
            } catch (Exception e) {
                log.warn("⚠️ Food {} deletion failed: Cloudinary image deletion error: {}", id, e.getMessage());
                // Log warning but don't fail the deletion - Cloudinary error shouldn't prevent deletion
            }
        }

        log.info("✓ Food deleted successfully: {}", id);
    }

    public FoodResponseDto getFoodById(Long id) {

        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Food not found"));

        return mapToDto(food);
    }

    public PaginatedFoodResponseDto getAllFoodsPaginated(int page, int size) {
        // Convert 1-based page to 0-based for Spring Data
        if (page < 1) page = 1;
        if (size < 1) size = 10;
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

    public List<FoodResponseDto> filterFoods(List<FoodCategory> categories, Boolean featured, 
                                             Unit unit, Long minPrice, Long maxPrice, Region region) {
        log.info("Filtering foods - categories: {}, featured: {}, unit: {}, price: {} - {}, region: {}", 
                  categories, featured, unit, minPrice, maxPrice, region);
        
        return foodRepository.findAll(FoodSpecification.filterByCriteria(categories, featured, unit, minPrice, maxPrice, region))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Hàm resolveImage đã bị xóa bỏ vì không hợp lệ với Transactions

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
