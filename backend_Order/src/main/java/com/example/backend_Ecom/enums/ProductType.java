package com.example.backend_Ecom.enums;

public enum ProductType {
    FOOD("Food", "Thức ăn"),
    DRINK("Drink", "Nước uống"),
    DESSERT("Dessert", "Tdessert"),
    FRESH("Fresh", "Tươi sống");

    private final String englishName;
    private final String vietnameseName;

    ProductType(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }
}
