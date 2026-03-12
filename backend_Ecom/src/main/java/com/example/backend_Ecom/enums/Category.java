package com.example.backend_Ecom.enums;

public enum Category {
    DRINK("Drink", "Thức uống"),
    FOOD("Food", "Thực phẩm"),
    FRESH("Fresh", "Tươi sống");

    private final String englishName;
    private final String vietnameseName;

    Category(String englishName, String vietnameseName) {
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
