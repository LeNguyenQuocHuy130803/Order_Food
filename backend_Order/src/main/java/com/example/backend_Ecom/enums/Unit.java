package com.example.backend_Ecom.enums;

public enum Unit {
    KG("Kilogram", "ký"),
    GRAM("Gram", "gram"),
    HG("Hectogram", "lạng"),
    LITER("Liter", "lít"),
    ML("Milliliter", "ml"),
    CUP("Cup", "ly"),
    BOTTLE("Bottle", "chai"),
    BOX("Box", "hộp"),
    SERVING("Serving", "suất"),
    CAN("Can", "lon"),
    BOWL("Bowl", "tô"),
    PORTION("Portion", "phần"),
    PACK("Pack", "gói"),
    CARTON("Carton", "thùng"),
    BAG("Bag", "bịch"),
    FRUIT("Fruit", "quả"),
    SKEWER("Skewer", "xiên"),
    ITEM("Item", "cái");

    private final String englishName;
    private final String vietnameseName;

    Unit(String englishName, String vietnameseName) {
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
