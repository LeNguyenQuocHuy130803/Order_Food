package com.example.backend_Ecom.enums;

public enum FreshCategory {
    VEGETABLE("Vegetable", "Rau củ"),
    FRUIT("Fruit", "Trái cây"),
    MEAT("Meat", "Thịt tươi"),
    SEAFOOD("Seafood", "Hải sản"),
    DAIRY("Dairy", "Sữa & Trứng"),
    HERB("Herb", "Thảo mộc");

    private final String englishName;
    private final String vietnameseName;

    FreshCategory(String englishName, String vietnameseName) {
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
