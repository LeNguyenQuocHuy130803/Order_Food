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

@Slf4j
@RequiredArgsConstructor
@Service
public class DessertService {

    private final DessertRepository dessertRepository;
    private final FileUploadService fileUploadService;

    /**
     * Tạo dessert mới
     */
    public DessertResponseDto createDessert(DessertRequestDto request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Dessert name cannot be empty");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Price must be greater than 0");
        }
        if (request.getQuantity() != null && request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity cannot be negative");
        }

        if (dessertRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Dessert name already exists");
        }

        String imageUrl = resolveImage(request, null);

        Dessert dessert = Dessert.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .imageUrl(imageUrl)
                .category(request.getCategory() != null ? request.getCategory() : DessertCategory.CAKE)
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .unit(request.getUnit() != null ? request.getUnit() : Unit.ITEM)
                .region(request.getRegion() != null ? request.getRegion() : Region.HA_NOI)
                .build();

        dessert = dessertRepository.save(dessert);

        log.info("✓ Dessert created: {}", dessert.getId());
        return mapToDto(dessert);
    }

    /**
     * Cập nhật dessert
     */
    public DessertResponseDto updateDessert(Long id, DessertRequestDto request) {

        Dessert dessert = dessertRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert not found"));

        if (request.getName() != null &&
                !dessert.getName().equals(request.getName()) &&
                dessertRepository.existsByName(request.getName())) {

            throw new AppException(ErrorCode.INVALID_REQUEST, "Dessert name already exists");
        }

        if (request.getName() != null) dessert.setName(request.getName());
        if (request.getDescription() != null) dessert.setDescription(request.getDescription());
        if (request.getPrice() != null) dessert.setPrice(request.getPrice());
        if (request.getQuantity() != null) dessert.setQuantity(request.getQuantity());
        if (request.getCategory() != null) dessert.setCategory(request.getCategory());
        if (request.getFeatured() != null) dessert.setFeatured(request.getFeatured());
        if (request.getUnit() != null) dessert.setUnit(request.getUnit());
        if (request.getRegion() != null) dessert.setRegion(request.getRegion());

        String imageUrl = resolveImage(request, dessert.getImageUrl());
        if (imageUrl != null) dessert.setImageUrl(imageUrl);

        dessert = dessertRepository.save(dessert);

        log.info("✓ Dessert updated: {}", id);
        return mapToDto(dessert);
    }

    /**
     * Xóa dessert
     */
    public void deleteDessert(Long id) {

        Dessert dessert = dessertRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Dessert not found"));

        if (dessert.getImageUrl() != null) {
            fileUploadService.deleteImage(dessert.getImageUrl());
        }

        dessertRepository.delete(dessert);

        log.info("✓ Dessert deleted: {}", id);
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

    /**
     * Helper: Xử lý upload ảnh (có file hoặc URL)
     */
    private String resolveImage(DessertRequestDto request, String currentImage) {

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
