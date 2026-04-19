package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.FreshRequestDto;
import com.example.backend_Ecom.dto.FreshResponseDto;
import com.example.backend_Ecom.dto.PaginatedFreshResponseDto;
import com.example.backend_Ecom.entity.Fresh;
import com.example.backend_Ecom.enums.FreshCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.FreshRepository;
import com.example.backend_Ecom.specification.FreshSpecification;
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
public class FreshService {

    private final FreshRepository freshRepository;
    private final FileUploadService fileUploadService;



    @Transactional
    public FreshResponseDto createFresh(FreshRequestDto request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Fresh product name cannot be empty");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Price must be greater than 0");
        }
        if (request.getQuantity() != null && request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity cannot be negative");
        }

        if (freshRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Fresh product name already exists");
        }

        String uploadedImageUrl = null;
        try {
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                uploadedImageUrl = fileUploadService.uploadImage(request.getImage());
            } else if (request.getImageUrl() != null) {
                uploadedImageUrl = request.getImageUrl();
            }

            Fresh fresh = Fresh.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .price(request.getPrice())
                    .quantity(request.getQuantity())
                    .imageUrl(uploadedImageUrl)
                    .category(request.getCategory() != null ? request.getCategory() : FreshCategory.VEGETABLE)
                    .featured(request.getFeatured() != null ? request.getFeatured() : false)
                    .unit(request.getUnit() != null ? request.getUnit() : Unit.ITEM)
                    .region(request.getRegion() != null ? request.getRegion() : Region.HA_NOI)
                    .build();

            fresh = freshRepository.save(fresh);
            return mapToDto(fresh);

        } catch (Exception e) {
            if (uploadedImageUrl != null && request.getImage() != null && !request.getImage().isEmpty()) {
                try {
                    fileUploadService.deleteImage(uploadedImageUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete orphaned image: {}", uploadedImageUrl);
                }
            }
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to create fresh product: " + e.getMessage());
        }
    }

    @Transactional
    public FreshResponseDto updateFresh(Long id, FreshRequestDto request) {

        Fresh fresh = freshRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));

        if (request.getName() != null &&
                !fresh.getName().equals(request.getName()) &&
                freshRepository.existsByName(request.getName())) {

            throw new AppException(ErrorCode.INVALID_REQUEST, "Fresh product name already exists");
        }

        String oldImageUrl = fresh.getImageUrl();
        String newlyUploadedUrl = null;

        try {
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                newlyUploadedUrl = fileUploadService.uploadImage(request.getImage());
                fresh.setImageUrl(newlyUploadedUrl);
            } else if (request.getImageUrl() != null) {
                fresh.setImageUrl(request.getImageUrl());
            }

            if (request.getName() != null) fresh.setName(request.getName());
            if (request.getDescription() != null) fresh.setDescription(request.getDescription());
            if (request.getPrice() != null) fresh.setPrice(request.getPrice());
            if (request.getQuantity() != null) fresh.setQuantity(request.getQuantity());
            if (request.getCategory() != null) fresh.setCategory(request.getCategory());
            if (request.getFeatured() != null) fresh.setFeatured(request.getFeatured());
            if (request.getUnit() != null) fresh.setUnit(request.getUnit());
            if (request.getRegion() != null) fresh.setRegion(request.getRegion());

            fresh = freshRepository.save(fresh);

            if (newlyUploadedUrl != null && oldImageUrl != null && !oldImageUrl.isEmpty()) {
                try {
                    fileUploadService.deleteImage(oldImageUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete old image: {}", oldImageUrl);
                }
            }

            log.info("✓ Fresh product updated: {}", id);
            return mapToDto(fresh);

        } catch (Exception e) {
            if (newlyUploadedUrl != null) {
                try {
                    fileUploadService.deleteImage(newlyUploadedUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete orphaned new image: {}", newlyUploadedUrl);
                }
            }
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to update fresh product: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteFresh(Long id) {
        Fresh fresh = freshRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));

        freshRepository.delete(fresh);
        freshRepository.flush();

        if (fresh.getImageUrl() != null) {
            try {
                fileUploadService.deleteImage(fresh.getImageUrl());
            } catch (Exception e) {
                log.warn("⚠️ Fresh {} deletion failed: Cloudinary image deletion error: {}", id, e.getMessage());
            }
        }

        log.info("✓ Fresh deleted successfully: {}", id);
    }

    public FreshResponseDto getFreshById(Long id) {

        Fresh fresh = freshRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));

        return mapToDto(fresh);
    }

    public PaginatedFreshResponseDto getAllFreshProductsPaginated(int page, int size) {
        // Convert 1-based page to 0-based for Spring Data
        if (page < 1) page = 1;
        if (size < 1) size = 10;
        Pageable pageable = PageRequest.of(page - 1, size);

        // Lấy dữ liệu phân trang từ repository
        Page<Fresh> freshPage = freshRepository.findAll(pageable);

        // Chuyển đổi Page<Fresh> thành List<FreshResponseDto>
        List<FreshResponseDto> freshDtos = freshPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Tạo response DTO với thông tin phân trang (convert back to 1-based for response)
        return PaginatedFreshResponseDto.builder()
                .data(freshDtos)
                .pageNumber(freshPage.getNumber() + 1)  // Convert back to 1-based
                .pageSize(freshPage.getSize())
                .totalRecords(freshPage.getTotalElements())
                .totalPages(freshPage.getTotalPages())
                .hasNext(freshPage.hasNext())
                .hasPrevious(freshPage.hasPrevious())
                .build();
    }

    public List<FreshResponseDto> filterFreshProducts(List<FreshCategory> categories, Boolean featured, 
                                                      Unit unit, Long minPrice, Long maxPrice, Region region) {
        log.info("Filtering fresh products - categories: {}, featured: {}, unit: {}, price: {} - {}, region: {}", 
                  categories, featured, unit, minPrice, maxPrice, region);
        
        return freshRepository.findAll(FreshSpecification.filterByCriteria(categories, featured, unit, minPrice, maxPrice, region))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Hàm resolveImage đã bị xóa bỏ vì không hợp lệ với Transactions

    private FreshResponseDto mapToDto(Fresh fresh) {

        return FreshResponseDto.builder()
                .id(fresh.getId())
                .name(fresh.getName())
                .description(fresh.getDescription())
                .price(fresh.getPrice())
                .quantity(fresh.getQuantity())
                .imageUrl(fresh.getImageUrl())
                .category(fresh.getCategory())
                .featured(fresh.getFeatured())
                .unit(fresh.getUnit())
                .region(fresh.getRegion())
                .createdAt(fresh.getCreatedAt())
                .updatedAt(fresh.getUpdatedAt())
                .build();
    }
}
