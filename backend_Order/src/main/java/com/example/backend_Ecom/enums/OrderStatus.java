package com.example.backend_Ecom.enums;

import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PENDING("Pending", "Chờ xác nhận"),
    PAID("Paid", "Đã thanh toán"),
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

    /**
     * State transition matrix — mỗi status chỉ được chuyển sang các status hợp lệ.
     *
     * PENDING    → PAID, CANCELLED
     * PAID       → CONFIRMED, CANCELLED
     * CONFIRMED  → PREPARING, CANCELLED
     * PREPARING  → READY, CANCELLED
     * READY      → DELIVERING, CANCELLED
     * DELIVERING → DELIVERED
     * DELIVERED  → (terminal — không chuyển được)
     * CANCELLED  → (terminal — không chuyển được)
     */
    public Set<OrderStatus> getAllowedTransitions() {
        return switch (this) {
            case PENDING    -> EnumSet.of(PAID, CONFIRMED, CANCELLED);
            case PAID       -> EnumSet.of(CONFIRMED, CANCELLED);
            case CONFIRMED  -> EnumSet.of(PREPARING, CANCELLED);
            case PREPARING  -> EnumSet.of(READY, CANCELLED);
            case READY      -> EnumSet.of(DELIVERING, CANCELLED);
            case DELIVERING -> EnumSet.of(DELIVERED, PAID);
            case DELIVERED, CANCELLED -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    /**
     * Kiểm tra transition có hợp lệ không
     */
    public boolean canTransitionTo(OrderStatus newStatus) {
        return getAllowedTransitions().contains(newStatus);
    }
}
