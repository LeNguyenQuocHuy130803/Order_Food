package com.example.backend_Ecom.enums;

public enum Region {
    HA_NOI("Hanoi", "Hà Nội"),
    HO_CHI_MINH("Ho Chi Minh", "Hồ Chí Minh"),
    DA_NANG("Da Nang", "Đà Nẵng"),
    HAI_PHONG("Hai Phong", "Hải Phòng"),
    CAN_THO("Can Tho", "Cần Thơ"),
    QUANG_NINH("Quang Ninh", "Quảng Ninh"),
    BINH_DUONG("Binh Duong", "Bình Dương"),
    DONG_NAI("Dong Nai", "Đồng Nai"),
    LÂMS_DONG("Lam Dong", "Lâm Đồng");

    private final String englishName;
    private final String vietnameseName;

    Region(String englishName, String vietnameseName) {
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
