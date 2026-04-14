package com.example.backend_Ecom.enums;

public enum DessertCategory {
    CAKE("Cake", "Bánh"),
    COOKIE("Cookie", "Bánh quy"),
    ICE_CREAM("Ice Cream", "Kem"),
    PUDDING("Pudding", "Bánh pudding"),
    TART("Tart", "Bánh tart"),
    BROWNIE("Brownie", "Bánh brownie"),
    MOUSSE("Mousse", "Mousse"),
    DONUT("Donut", "Bánh donut");

    private final String englishName;
    private final String vietnameseName;

    DessertCategory(String englishName, String vietnameseName) {
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
