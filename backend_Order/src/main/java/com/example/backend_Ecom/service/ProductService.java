package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.PaginatedProductResponseDto;
import com.example.backend_Ecom.dto.ProductRequestDto;
import com.example.backend_Ecom.dto.ProductResponseDto;
import com.example.backend_Ecom.entity.Product;
import com.example.backend_Ecom.enums.ProductType;
import com.example.backend_Ecom.enums.Region;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.ProductRepository;
import com.example.backend_Ecom.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final FileUploadService fileUploadService;

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaginatedProductResponseDto getProductsPaginated(ProductType category, int page, int size) {
        if (page < 1) page = 1;
        if (size < 1) size = 10;

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage = category != null
                ? productRepository.findByCategory(category, pageable)
                : productRepository.findAll(pageable);

        List<ProductResponseDto> dtos = productPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PaginatedProductResponseDto.builder()
                .data(dtos)
                .pageNumber(productPage.getNumber() + 1)
                .pageSize(productPage.getSize())
                .totalRecords(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> filterProducts(
            ProductType category,
            Boolean featured,
            Unit unit,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Region region,
            String search
    ) {
        Specification<Product> spec = ProductSpecification.filterProducts(
                category, featured, unit, minPrice, maxPrice, region, search
        );

        return productRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Product not found with ID: " + id));
        return mapToDto(product);
    }

    public ProductResponseDto createProduct(ProductRequestDto request) {
        if (productRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Product with name '" + request.getName() + "' already exists");
        }

        String imageUrl = request.getImageUrl();
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imageUrl = fileUploadService.uploadImage(request.getImage());
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 0)
                .imageUrl(imageUrl)
                .category(request.getCategory())
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .unit(request.getUnit() != null ? request.getUnit() : Unit.ITEM)
                .region(request.getRegion() != null ? request.getRegion() : Region.HA_NOI)
                .build();

        product = productRepository.save(product);
        log.info("✓ Product created: ID={}, Name={}, Category={}", product.getId(), product.getName(), product.getCategory());
        return mapToDto(product);
    }

    public ProductResponseDto updateProduct(Long id, ProductRequestDto request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Product not found with ID: " + id));

        if (request.getName() != null && !request.getName().equals(product.getName())) {
            if (productRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Product name '" + request.getName() + "' is already taken");
            }
            product.setName(request.getName());
        }

        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getQuantity() != null) product.setQuantity(request.getQuantity());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getFeatured() != null) product.setFeatured(request.getFeatured());
        if (request.getUnit() != null) product.setUnit(request.getUnit());
        if (request.getRegion() != null) product.setRegion(request.getRegion());

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String oldImage = product.getImageUrl();
            String newImage = fileUploadService.uploadImage(request.getImage());
            product.setImageUrl(newImage);

            if (oldImage != null) {
                try {
                    fileUploadService.deleteImage(oldImage);
                } catch (Exception e) {
                    log.warn("Failed to delete old image: {}", oldImage);
                }
            }
        } else if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }

        product = productRepository.save(product);
        log.info("✓ Product updated: ID={}", id);
        return mapToDto(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Product not found with ID: " + id));

        if (product.getImageUrl() != null) {
            try {
                fileUploadService.deleteImage(product.getImageUrl());
            } catch (Exception e) {
                log.warn("Failed to delete image on Cloudinary for product ID: {}", id);
            }
        }

        productRepository.delete(product);
        log.info("✓ Product deleted: ID={}", id);
    }

    private ProductResponseDto mapToDto(Product product) {
        return ProductResponseDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .imageUrl(product.getImageUrl())
                .category(product.getCategory())
                .featured(product.getFeatured())
                .unit(product.getUnit())
                .region(product.getRegion())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
