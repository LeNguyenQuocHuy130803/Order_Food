package com.example.backend_Ecom.enums;

public enum DrinkType {
    NORMAL("Bình thường"),
    FEATURED("Nổi bật");

    private final String label;

    DrinkType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
