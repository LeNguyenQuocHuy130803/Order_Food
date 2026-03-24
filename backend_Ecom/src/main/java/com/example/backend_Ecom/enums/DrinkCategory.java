package com.example.backend_Ecom.enums;

public enum DrinkCategory {
    COFFEE("Coffee", "Cà phê"),
    MILK_TEA("Milk Tea", "Trà sữa"),
    JUICE("Juice", "Nước ép"),
    TEA("Tea", "Trà");

    private final String englishName;
    private final String vietnameseName;

    DrinkCategory(String englishName, String vietnameseName) {
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
