package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.DrinkRequestDto;
import com.example.backend_Ecom.dto.DrinkResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
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

