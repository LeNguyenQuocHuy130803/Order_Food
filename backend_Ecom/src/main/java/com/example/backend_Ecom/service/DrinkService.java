package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.DrinkRequestDto;
import com.example.backend_Ecom.dto.DrinkResponseDto;
import com.example.backend_Ecom.entity.Drink;
import com.example.backend_Ecom.enums.Category;
import com.example.backend_Ecom.enums.DrinkType;
import com.example.backend_Ecom.enums.Unit;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.DrinkRepository;
import com.example.backend_Ecom.specification.DrinkSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class DrinkService {

    private final DrinkRepository drinkRepository;
    private final FileUploadService fileUploadService;

    public DrinkResponseDto createDrink(DrinkRequestDto request) {

        // vì tạo thì mấy cái này không thể null được nên phải check thủ công , ko dùng được file DriinkRequest vì file đó để lại cho updateDrink
        //  nếu dùng file đó thì phải để là @NotNull thì updateDrink sẽ bị lỗi vì update thì có thể không cần truyền price hoặc quantity
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Drink name cannot be empty");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Price must be greater than 0");
        }
        if (request.getQuantity() != null && request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Quantity cannot be negative");
        }

        if (drinkRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Drink name already exists");
        }

        String imageUrl = resolveImage(request, null);

        Drink drink = Drink.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .imageUrl(imageUrl)
                .category(request.getCategory() != null ? request.getCategory() : Category.DRINK)
                .type(request.getType())
                .unit(request.getUnit() != null ? request.getUnit() : Unit.ITEM)
                .build();

        drink = drinkRepository.save(drink);

//        log.info("✓ Drink created: {}", drink.getId());
        return mapToDto(drink);
    }

    public DrinkResponseDto updateDrink(Long id, DrinkRequestDto request) {

        Drink drink = drinkRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Drink not found"));

        if (request.getName() != null &&
                !drink.getName().equals(request.getName()) &&
                drinkRepository.existsByName(request.getName())) {

            throw new AppException(ErrorCode.INVALID_REQUEST, "Drink name already exists");
        }

        if (request.getName() != null) drink.setName(request.getName());
        if (request.getDescription() != null) drink.setDescription(request.getDescription());
        if (request.getPrice() != null) drink.setPrice(request.getPrice());
        if (request.getQuantity() != null) drink.setQuantity(request.getQuantity());
        if (request.getCategory() != null) drink.setCategory(request.getCategory());
        if (request.getType() != null) drink.setType(request.getType());
        if (request.getUnit() != null) drink.setUnit(request.getUnit());

        String imageUrl = resolveImage(request, drink.getImageUrl());
        if (imageUrl != null) drink.setImageUrl(imageUrl);

        drink = drinkRepository.save(drink);

        log.info("✓ Drink updated: {}", id);
        return mapToDto(drink);
    }

    public void deleteDrink(Long id) {

        Drink drink = drinkRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Drink not found"));

        if (drink.getImageUrl() != null) {
            fileUploadService.deleteImage(drink.getImageUrl());
        }

        drinkRepository.delete(drink);

        log.info("✓ Drink deleted: {}", id);
    }

    public DrinkResponseDto getDrinkById(Long id) {

        Drink drink = drinkRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Drink not found"));

        return mapToDto(drink);
    }

    public List<DrinkResponseDto> getAllDrinks() {

        return drinkRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DrinkResponseDto> searchByName(String name) {
        log.info("Searching drinks by name: {}", name);
        return drinkRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DrinkResponseDto> filterDrinks(String name, Category category, DrinkType type, 
                                                Unit unit, Long minPrice, Long maxPrice) {
        log.info("Filtering drinks - name: {}, category: {}, type: {}, unit: {}, price: {} - {}", 
                 name, category, type, unit, minPrice, maxPrice);
        
        return drinkRepository.findAll(DrinkSpecification.filterByCriteria(name, category, type, unit, minPrice, maxPrice))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private String resolveImage(DrinkRequestDto request, String currentImage) {

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

    private DrinkResponseDto mapToDto(Drink drink) {

        return DrinkResponseDto.builder()
                .id(drink.getId())
                .name(drink.getName())
                .description(drink.getDescription())
                .price(drink.getPrice())
                .quantity(drink.getQuantity())
                .imageUrl(drink.getImageUrl())
                .category(drink.getCategory())
                .type(drink.getType())
                .unit(drink.getUnit())
                .createdAt(drink.getCreatedAt())
                .updatedAt(drink.getUpdatedAt())
                .build();
    }
}