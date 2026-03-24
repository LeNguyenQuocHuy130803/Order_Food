package com.example.backend_Ecom.enums;

public enum UserStatus {
    ACTIVE("Active", "Hoạt động"),
    BANNED("Banned", "Bị chặn"),
    INACTIVE("Inactive", "Không hoạt động");

    private final String englishName;
    private final String vietnameseName;

    UserStatus(String englishName, String vietnameseName) {
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
