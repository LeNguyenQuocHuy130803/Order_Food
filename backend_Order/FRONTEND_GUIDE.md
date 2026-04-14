# 🚀 HƯỚNG DẪN FRONTEND - API FILTER

## 📌 BASE URL
```
http://localhost:8080/api/drinks
```

---

## **LỌC SẢN PHẨM (FILTER)**

### Endpoint
```
GET /api/drinks/filter?categories={cat}&featured={true/false}&unit={unit}&minPrice={min}&maxPrice={max}&region={region}
```

### Tham số (tất cả optional)
| Tham số | Giá trị | Ví dụ |
|--------|--------|-------|
| **categories** | COFFEE, MILK_TEA, JUICE, TEA (có thể nhiều) | COFFEE hoặc COFFEE,TEA |
| featured | true, false | true |
| unit | CUP, BOTTLE, BOX, ... | CUP |
| minPrice | Số | 20000 |
| maxPrice | Số | 100000 |
| region | HA_NOI, HO_CHI_MINH, DA_NANG, ... | HA_NOI |

### Ví dụ Request

**Lọc theo 1 category:**
```
GET /api/drinks/filter?categories=COFFEE
```

**Lọc theo nhiều categories (OR logic):**
```
GET /api/drinks/filter?categories=COFFEE&categories=TEA
```

hoặc:
```
GET /api/drinks/filter?categories=COFFEE,TEA,JUICE
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

**Lọc kết hợp (COFFEE hoặc TEA, nổi bật, ở Hà Nội, giá 20k-50k):**
```
GET /api/drinks/filter?categories=COFFEE&categories=TEA&featured=true&minPrice=20000&maxPrice=50000&region=HA_NOI
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
    "region": "HA_NOI",
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

## �️ **JAVASCRIPT/REACT EXAMPLES**


### Filter - Đơn giản
```javascript
// Function filter đơn giản
const filterDrinks = (filters) => {
  const params = new URLSearchParams();
  
  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach(cat => params.append('categories', cat));
  }
  if (filters.featured !== undefined) params.append('featured', filters.featured);
  if (filters.unit) params.append('unit', filters.unit);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.region) params.append('region', filters.region);
  
  fetch(`http://localhost:8080/api/drinks/filter?${params}`)
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
};

// Ví dụ sử dụng
filterDrinks({
  categories: ['COFFEE'],
  featured: true,
  region: 'HA_NOI',
  minPrice: 20000,
  maxPrice: 100000
});

// Lọc nhiều categories
filterDrinks({
  categories: ['COFFEE', 'TEA', 'JUICE'],
  minPrice: 15000,
  maxPrice: 150000
});
```

### Filter - Advanced (React Hook)
```javascript
import { useState } from 'react';

const DrinkFilter = () => {
  const [filters, setFilters] = useState({
    categories: [],
    featured: false,
    minPrice: null,
    maxPrice: null,
    region: null
  });

  const handleCategoryChange = (category) => {
    setFilters(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const applyFilter = () => {
    const params = new URLSearchParams();
    
    filters.categories.forEach(cat => params.append('categories', cat));
    if (filters.featured) params.append('featured', true);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.region) params.append('region', filters.region);
    
    fetch(`http://localhost:8080/api/drinks/filter?${params}`)
      .then(res => res.json())
      .then(data => setDrinks(data))
      .catch(err => console.error(err));
  };

  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          onChange={() => handleCategoryChange('COFFEE')}
          checked={filters.categories.includes('COFFEE')}
        />
        Cà phê
      </label>
      <label>
        <input 
          type="checkbox"
          onChange={() => handleCategoryChange('TEA')}
          checked={filters.categories.includes('TEA')}
        />
        Trà
      </label>
      <label>
        <input 
          type="checkbox"
          onChange={() => handleCategoryChange('JUICE')}
          checked={filters.categories.includes('JUICE')}
        />
        Nước ép
      </label>
      
      <button onClick={applyFilter}>Lọc</button>
    </div>
  );
};
```

---

## �📚 **ENUM VALUES**

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

