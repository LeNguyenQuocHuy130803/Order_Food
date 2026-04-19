package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.DessertRequestDto;
import com.example.backend_Ecom.dto.DessertResponseDto;
import com.example.backend_Ecom.dto.PaginatedDessertResponseDto;
import com.example.backend_Ecom.entity.Dessert;
import com.example.backend_Ecom.enums.DessertCategory;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.DessertRepository;
import com.example.backend_Ecom.specification.DessertSpecification;
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
public class DessertService {

    private final DessertRepository dessertRepository;
    private final FileUploadService fileUploadService;



    /**
     * Tạo dessert mới
     */
    @Transactional
    public DessertResponseDto createDessert(DessertRequestDto request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Dessert name cannot be empty");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Price must be greater than 0");
        }
        if (request.getQuantity() != null && request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity cannot be negative");
        }

        if (dessertRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Dessert name already exists");
        }

        String uploadedImageUrl = null;
        try {
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                uploadedImageUrl = fileUploadService.uploadImage(request.getImage());
            } else if (request.getImageUrl() != null) {
                uploadedImageUrl = request.getImageUrl();
            }

            Dessert dessert = Dessert.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .price(request.getPrice())
                    .quantity(request.getQuantity())
                    .imageUrl(uploadedImageUrl)
                    .category(request.getCategory() != null ? request.getCategory() : DessertCategory.CAKE)
                    .featured(request.getFeatured() != null ? request.getFeatured() : false)
                    .unit(request.getUnit() != null ? request.getUnit() : Unit.ITEM)
                    .region(request.getRegion() != null ? request.getRegion() : Region.HA_NOI)
                    .build();

            dessert = dessertRepository.save(dessert);
            log.info("✓ Dessert created: {}", dessert.getId());
            return mapToDto(dessert);

        } catch (Exception e) {
            if (uploadedImageUrl != null && request.getImage() != null && !request.getImage().isEmpty()) {
                try {
                    fileUploadService.deleteImage(uploadedImageUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete orphaned image: {}", uploadedImageUrl);
                }
            }
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to create dessert: " + e.getMessage());
        }
    }

    /**
     * Cập nhật dessert
     */
    @Transactional
    public DessertResponseDto updateDessert(Long id, DessertRequestDto request) {

        Dessert dessert = dessertRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert not found"));

        if (request.getName() != null &&
                !dessert.getName().equals(request.getName()) &&
                dessertRepository.existsByName(request.getName())) {

            throw new AppException(ErrorCode.INVALID_REQUEST, "Dessert name already exists");
        }

        String oldImageUrl = dessert.getImageUrl();
        String newlyUploadedUrl = null;

        try {
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                newlyUploadedUrl = fileUploadService.uploadImage(request.getImage());
                dessert.setImageUrl(newlyUploadedUrl);
            } else if (request.getImageUrl() != null) {
                dessert.setImageUrl(request.getImageUrl());
            }

            if (request.getName() != null) dessert.setName(request.getName());
            if (request.getDescription() != null) dessert.setDescription(request.getDescription());
            if (request.getPrice() != null) dessert.setPrice(request.getPrice());
            if (request.getQuantity() != null) dessert.setQuantity(request.getQuantity());
            if (request.getCategory() != null) dessert.setCategory(request.getCategory());
            if (request.getFeatured() != null) dessert.setFeatured(request.getFeatured());
            if (request.getUnit() != null) dessert.setUnit(request.getUnit());
            if (request.getRegion() != null) dessert.setRegion(request.getRegion());

            dessert = dessertRepository.save(dessert);

            if (newlyUploadedUrl != null && oldImageUrl != null && !oldImageUrl.isEmpty()) {
                try {
                    fileUploadService.deleteImage(oldImageUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete old image: {}", oldImageUrl);
                }
            }

            log.info("✓ Dessert updated: {}", id);
            return mapToDto(dessert);

        } catch (Exception e) {
            if (newlyUploadedUrl != null) {
                try {
                    fileUploadService.deleteImage(newlyUploadedUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete orphaned new image: {}", newlyUploadedUrl);
                }
            }
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to update dessert: " + e.getMessage());
        }
    }

    /**
     * Xóa dessert
     */
    @Transactional
    public void deleteDessert(Long id) {
        Dessert dessert = dessertRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert not found"));

        dessertRepository.delete(dessert);
        dessertRepository.flush();

        if (dessert.getImageUrl() != null) {
            try {
                fileUploadService.deleteImage(dessert.getImageUrl());
            } catch (Exception e) {
                log.warn("⚠️ Dessert {} deletion failed: Cloudinary image deletion error: {}", id, e.getMessage());
            }
        }

        log.info("✓ Dessert deleted successfully: {}", id);
    }

    /**
     * Lấy dessert theo ID
     */
    public DessertResponseDto getDessertById(Long id) {

        Dessert dessert = dessertRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert not found"));

        return mapToDto(dessert);
    }

    /**
     * Lấy tất cả desserts với phân trang
     */
    public PaginatedDessertResponseDto getAllDessertsPaginated(int page, int size) {
        // Convert 1-based page to 0-based for Spring Data
        if (page < 1) page = 1;
        if (size < 1) size = 10;
        Pageable pageable = PageRequest.of(page - 1, size);

        // Lấy dữ liệu phân trang từ repository
        Page<Dessert> dessertPage = dessertRepository.findAll(pageable);

        // Chuyển đổi Page<Dessert> thành List<DessertResponseDto>
        List<DessertResponseDto> dessertDtos = dessertPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Tạo response DTO với thông tin phân trang (convert back to 1-based for response)
        return PaginatedDessertResponseDto.builder()
                .data(dessertDtos)
                .pageNumber(dessertPage.getNumber() + 1)  // Convert back to 1-based
                .pageSize(dessertPage.getSize())
                .totalRecords(dessertPage.getTotalElements())
                .totalPages(dessertPage.getTotalPages())
                .hasNext(dessertPage.hasNext())
                .hasPrevious(dessertPage.hasPrevious())
                .build();
    }

    /**
     * Lọc desserts theo tiêu chí
     */
    public List<DessertResponseDto> filterDesserts(List<DessertCategory> categories, Boolean featured, 
                                                    Unit unit, Long minPrice, Long maxPrice, Region region) {
        log.info("Filtering desserts - categories: {}, featured: {}, unit: {}, price: {} - {}, region: {}", 
                  categories, featured, unit, minPrice, maxPrice, region);
        
        return dessertRepository.findAll(DessertSpecification.filterByCriteria(categories, featured, unit, minPrice, maxPrice, region))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Hàm resolveImage đã bị xóa bỏ vì không hợp lệ với Transactions

    /**
     * Helper: Convert Dessert entity sang DessertResponseDto
     */
    private DessertResponseDto mapToDto(Dessert dessert) {

        return DessertResponseDto.builder()
                .id(dessert.getId())
                .name(dessert.getName())
                .description(dessert.getDescription())
                .price(dessert.getPrice())
                .quantity(dessert.getQuantity())
                .imageUrl(dessert.getImageUrl())
                .category(dessert.getCategory())
                .featured(dessert.getFeatured())
                .unit(dessert.getUnit())
                .region(dessert.getRegion())
                .createdAt(dessert.getCreatedAt())
                .updatedAt(dessert.getUpdatedAt())
                .build();
    }
}
