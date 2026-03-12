# 🚀 HƯỚNG DẪN FRONTEND - API SEARCH & FILTER

## 📌 BASE URL
```
http://localhost:8080/api/drinks
```

---

## 1️⃣ **TÌM KIẾM NÂNG CAO (SEARCH)**

### Endpoint
```
GET /api/drinks/search?name={keyword}&description={keyword}&category={category}&region={region}
```

### Tham số (tất cả optional)
| Tham số | Giá trị | Ví dụ |
|--------|--------|-------|
| name | Từ khóa trong tên | coffee |
| description | Từ khóa trong mô tả | black |
| category | COFFEE, MILK_TEA, JUICE, TEA | COFFEE |
| region | HA_NOI, HO_CHI_MINH, DA_NANG, HAI_PHONG, CAN_THO, ... | HA_NOI |

### Ví dụ Request

**Tìm theo tên:**
```
GET /api/drinks/search?name=coffee
```

**Tìm theo description:**
```
GET /api/drinks/search?description=black
```

**Tìm theo category:**
```
GET /api/drinks/search?category=COFFEE
```

**Tìm theo khu vực:**
```
GET /api/drinks/search?region=HA_NOI
```

**Kết hợp tên + region:**
```
GET /api/drinks/search?name=coffee&region=HA_NOI
```

**Kết hợp cả 4 tiêu chí:**
```
GET /api/drinks/search?name=coffee&description=strong&category=COFFEE&region=HA_NOI
```

### Response (200 OK)
```json
[
  {
    "id": 1,
    "name": "Cà phê Đen",
    "description": "Strong black coffee with a rich aroma",
    "price": 25000,
    "category": "COFFEE",
    "featured": true,
    "unit": "CUP",
    "region": "HANOI",
    ...
  }
]
```


## 2️⃣ **LỌC SẢN PHẨM (FILTER)**

### Endpoint
```
GET /api/drinks/filter?category={cat}&featured={true/false}&unit={unit}&minPrice={min}&maxPrice={max}&region={region}
```

### Tham số (tất cả optional)
| Tham số | Giá trị | Ví dụ |
|--------|--------|-------|
| category | COFFEE, MILK_TEA, JUICE, TEA | COFFEE |
| featured | true, false | true |
| unit | CUP, BOTTLE, BOX, ... | CUP |
| minPrice | Số | 20000 |
| maxPrice | Số | 100000 |
| region | HA_NOI, HO_CHI_MINH, DA_NANG, HAI_PHONG, CAN_THO, ... | HA_NOI |

### Ví dụ Request

**Lọc theo category:**
```
GET /api/drinks/filter?category=COFFEE
```

**Lọc sản phẩm nổi bật:**
```
GET /api/drinks/filter?featured=true
```

**Lọc theo khu vực:**
```
GET /api/drinks/filter?region=HA_NOI
```

**Lọc theo giá:**
```
GET /api/drinks/filter?minPrice=20000&maxPrice=100000
```

**Lọc kết hợp:**
```
GET /api/drinks/filter?category=COFFEE&featured=true&unit=CUP&minPrice=20000&maxPrice=50000&region=HA_NOI
```

### Response (200 OK)
```json
[
  {
    "id": 1,
    "name": "Cà phê Đen",
    "price": 25000,
    "category": "COFFEE",
    "featured": true,
    "unit": "CUP",
    "region": "HANOI",
    ...
  }
]
```

### ⚠️ **Validation Error - Invalid Price Range**
Nếu `minPrice > maxPrice`:

**Request:**
```
GET /api/drinks/filter?minPrice=500000&maxPrice=50000
```

**Response (400 Bad Request):**
```json
{
  "status": 400,
  "code": "INVALID_REQUEST",
  "message": "minPrice (500000) cannot be greater than maxPrice (50000)",
  "timestamp": "2026-03-12T21:14:26.736+07:00"
}
```

---

## 📚 **ENUM VALUES**

### Category (Loại sản phẩm)
```
COFFEE     → Cà phê
MILK_TEA   → Trà sữa
JUICE      → Nước ép
TEA        → Trà
```

### Region (Khu vực)
```
HA_NOI      → Hà Nội
HO_CHI_MINH → Hồ Chí Minh
DA_NANG     → Đà Nẵng
HAI_PHONG   → Hải Phòng
CAN_THO     → Cần Thơ
QUANG_NINH  → Quảng Ninh
BINH_DUONG  → Bình Dương
DONG_NAI    → Đồng Nai
LAMS_DONG   → Lâm Đồng
```

### Unit (Đơn vị)
```
CUP        → Ly
BOTTLE     → Chai
BOX        → Hộp
CAN        → Lon
SERVING    → Suất
PORTION    → Phần
PACK       → Gói
CARTON     → Thùng
BAG        → Bịch
FRUIT      → Quả
SKEWER     → Xiên
ITEM       → Cái
KG         → Kilogram
GRAM       → Gram
LITER      → Lít
ML         → Mililit
HG         → Hectogram
BOWL       → Tô
```

---


## ✅ **ERROR RESPONSES**

### 400 - Bad Request
```json
{
  "status": 400,
  "code": "INVALID_REQUEST",
  "message": "Drink name cannot be empty",
  "timestamp": "2026-03-12T10:30:00"
}
```

### 404 - Not Found
```json
{
  "status": 404,
  "code": "INVALID_REQUEST",
  "message": "Drink not found",
  "timestamp": "2026-03-12T10:30:00"
}
```

### 500 - Server Error
```json
{
  "status": 500,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred",
  "timestamp": "2026-03-12T10:30:00"
}
```

