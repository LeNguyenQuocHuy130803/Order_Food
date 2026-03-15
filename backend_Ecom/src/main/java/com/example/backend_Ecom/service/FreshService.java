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

@Slf4j
@RequiredArgsConstructor
@Service
public class FreshService {

    private final FreshRepository freshRepository;
    private final FileUploadService fileUploadService;

    public FreshResponseDto createFresh(FreshRequestDto request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Fresh product name cannot be empty");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Price must be greater than 0");
        }
        if (request.getQuantity() != null && request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity cannot be negative");
        }

        if (freshRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Fresh product name already exists");
        }

        String imageUrl = resolveImage(request, null);

        Fresh fresh = Fresh.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .imageUrl(imageUrl)
                .category(request.getCategory() != null ? request.getCategory() : FreshCategory.VEGETABLE)
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .unit(request.getUnit() != null ? request.getUnit() : Unit.ITEM)
                .region(request.getRegion() != null ? request.getRegion() : Region.HA_NOI)
                .build();

        fresh = freshRepository.save(fresh);

        return mapToDto(fresh);
    }

    public FreshResponseDto updateFresh(Long id, FreshRequestDto request) {

        Fresh fresh = freshRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));

        if (request.getName() != null &&
                !fresh.getName().equals(request.getName()) &&
                freshRepository.existsByName(request.getName())) {

            throw new AppException(ErrorCode.INVALID_REQUEST, "Fresh product name already exists");
        }

        if (request.getName() != null) fresh.setName(request.getName());
        if (request.getDescription() != null) fresh.setDescription(request.getDescription());
        if (request.getPrice() != null) fresh.setPrice(request.getPrice());
        if (request.getQuantity() != null) fresh.setQuantity(request.getQuantity());
        if (request.getCategory() != null) fresh.setCategory(request.getCategory());
        if (request.getFeatured() != null) fresh.setFeatured(request.getFeatured());
        if (request.getUnit() != null) fresh.setUnit(request.getUnit());
        if (request.getRegion() != null) fresh.setRegion(request.getRegion());

        String imageUrl = resolveImage(request, fresh.getImageUrl());
        if (imageUrl != null) fresh.setImageUrl(imageUrl);

        fresh = freshRepository.save(fresh);

        log.info("✓ Fresh product updated: {}", id);
        return mapToDto(fresh);
    }

    public void deleteFresh(Long id) {

        Fresh fresh = freshRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));

        if (fresh.getImageUrl() != null) {
            fileUploadService.deleteImage(fresh.getImageUrl());
        }

        freshRepository.delete(fresh);

        log.info("✓ Fresh product deleted: {}", id);
    }

    public FreshResponseDto getFreshById(Long id) {

        Fresh fresh = freshRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Fresh product not found"));

        return mapToDto(fresh);
    }

    public PaginatedFreshResponseDto getAllFreshProductsPaginated(int page, int size) {
        // Convert 1-based page to 0-based for Spring Data
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

    public List<FreshResponseDto> advancedSearch(String name, String description, FreshCategory category, Region region) {
        log.info("Advanced search - name: {}, description: {}, category: {}, region: {}", name, description, category, region);
        return freshRepository.findAll(FreshSpecification.advancedSearchCriteria(name, description, category, region))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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

    private String resolveImage(FreshRequestDto request, String currentImage) {

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
