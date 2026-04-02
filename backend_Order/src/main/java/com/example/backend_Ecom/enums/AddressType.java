package com.example.backend_Ecom.enums;

public enum AddressType {
    HOME("Home", "Nhà"),
    WORK("Work", "Công ty"),
    SCHOOL("School", "Trường học"),
    OTHER("Other", "Khác");

    private final String englishName;
    private final String vietnameseName;

    AddressType(String englishName, String vietnameseName) {
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
