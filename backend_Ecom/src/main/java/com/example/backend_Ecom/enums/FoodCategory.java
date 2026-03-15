package com.example.backend_Ecom.enums;

public enum FoodCategory {
    RICE("Rice", "Cơm"),
    NOODLE("Noodle", "Mì"),
    BREAD("Bread", "Bánh mì"),
    MEAT("Meat", "Thịt"),
    SOUP("Soup", "Súp"),
    SALAD("Salad", "Salad"),
    PIZZA("Pizza", "Pizza"),
    BURGER("Burger", "Burger");

    private final String englishName;
    private final String vietnameseName;

    FoodCategory(String englishName, String vietnameseName) {
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
