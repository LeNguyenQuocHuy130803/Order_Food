package com.example.backend_Ecom.enums;

public enum OrderStatus {
    PENDING("Pending", "Chờ xác nhận"),
    CONFIRMED("Confirmed", "Đã xác nhận"),
    PREPARING("Preparing", "Đang chuẩn bị"),
    READY("Ready", "Sẵn sàng giao"),
    DELIVERING("Delivering", "Đang giao"),
    DELIVERED("Delivered", "Đã giao"),
    CANCELLED("Cancelled", "Đã hủy");

    private final String englishName;
    private final String vietnameseName;

    OrderStatus(String englishName, String vietnameseName) {
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
