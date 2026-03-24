# 📊 Data Flow Guide - E-commerce API to UI

## 🎯 Tổng Quan Data Flow

```
Backend (Spring Boot API)
        ↓ (axios.get)
Service Layer (FoodService.ts)
        ↓ (return Promise<Data>)
Hooks Layer (useFoods.ts)
        ↓ (setState)
Component Layer (FoodPageClient.tsx)
        ↓ (props)
UI Components (ResultsDisplay.tsx, ProductCard.tsx)
        ↓
User Browser (Giao diện)
```

---

## 🔄 Chi Tiết Data Flow - Từng Bước

### **Step 1️⃣: Call API - Service Layer (FILE LÀM ĐẦU TIÊN)**

**File: `service/FoodService.ts`**

```typescript
// ✅ Bước 1: Import axios
import axios from "axios";
import type { Food, PaginatedFoodResponse } from "@/types/food";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ✅ Bước 2: Định nghĩa hàm gọi API
export const getAllFoodsPaginated = async (
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedFoodResponse> => {
  try {
    // ✅ Bước 3: Gọi axios.get tới backend
    const res = await axios.get<PaginatedFoodResponse>(
      `${API_URL}/foods/paging`,
      {
        params: {
          page,
          size: pageSize,
        },
      }
    );
    
    // ✅ Bước 4: Return data từ backend
    // res.data = {
    //   data: [...foods],
    //   pageNumber: 1,
    //   pageSize: 9,
    //   totalRecords: 100,
    //   totalPages: 11,
    //   hasNext: true,
    //   hasPrevious: false
    // }
    return res.data;
  } catch (error) {
    console.error("Error in getAllFoodsPaginated:", error);
    throw error;
  }
};

// ✅ Export để hooks có thể import
export const FoodService = {
  getAllFoodsPaginated,
  // ... other methods
};
```

**Dữ liệu ở đây:**
```
Backend Response:
{
  data: [
    { id: 1, name: "Cơm tấm", price: 50000, imageUrl: "...", ... },
    { id: 2, name: "Bánh mì", price: 15000, imageUrl: "...", ... },
    ...
  ],
  pageNumber: 1,
  pageSize: 9,
  totalPages: 11,
  hasNext: true,
  hasPrevious: false
}
```

---

### **Step 2️⃣: Quản Lý State - Hooks Layer (FILE LÀM THỨ 2)**

**File: `hooks/useFoods.ts`**

```typescript
// ✅ Bước 1: Import service + types
"use client";
import { useEffect, useState } from "react";
import { FoodService } from "@/service/FoodService";
import type { Food } from "@/types/food";
import type { FilterParams } from "@/types/drink";

// ✅ Bước 2: Định nghĩa return type
interface UseFoodsResult {
  foods: Food[];                  // Danh sách sản phẩm
  loading: boolean;               // Đang tải?
  error: string | null;           // Có lỗi không?
  totalPages: number;             // Tổng số trang
}

// ✅ Bước 3: Hook function
export function useFoods(
  filters: FilterParams,
  page: number,
  pageSize: number
): UseFoodsResult {
  // Khai báo states
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ Bước 4: useEffect chạy khi component mount
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);           // Bắt đầu loading
        setError(null);             // Clear error cũ

        if (Object.keys(filters).length > 0) {
          // ✅ Bước 5a: Nếu có filter → call filterFoods
          const filteredData = await FoodService.filterFoods(
            filters.categories,
            filters.featured,
            filters.unit,
            filters.minPrice,
            filters.maxPrice,
            filters.region
          );

          // ✅ Bước 6a: Set state với filtered data
          setFoods(filteredData);     // Array foods
          setTotalPages(1);           // Không phân trang khi filter
        } else {
          // ✅ Bước 5b: Không có filter → call getAllFoodsPaginated
          const response = await FoodService.getAllFoodsPaginated(
            page,
            pageSize
          );

          // ✅ Bước 6b: Set state với paginated data
          setFoods(response.data);           // Array foods từ response
          setTotalPages(response.totalPages); // Tổng trang
        }
      } catch (err) {
        // ✅ Bước 7: Error handling
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi tải dữ liệu";

        setError(errorMessage);
      } finally {
        // ✅ Bước 8: Set loading = false
        setLoading(false);
      }
    };

    fetchFoods();
  }, [filters, page, pageSize]);  // Dependency array

  // ✅ Bước 9: Return object
  return {
    foods,
    loading,
    error,
    totalPages,
  };
}
```

**State ở đây:**
```javascript
// Trước khi fetch
{
  foods: [],
  loading: true,
  error: null,
  totalPages: 0
}

// Sau khi fetch thành công
{
  foods: [
    { id: 1, name: "Cơm tấm", price: 50000, ... },
    { id: 2, name: "Bánh mì", price: 15000, ... }
  ],
  loading: false,
  error: null,
  totalPages: 11
}

// Nếu có lỗi
{
  foods: [],
  loading: false,
  error: "Failed to fetch: 500 Internal Server Error",
  totalPages: 0
}
```

---

### **Step 3️⃣: Nhập Data vào Component (FILE LÀM THỨ 3)**

**File: `app/food/FoodPageClient.tsx`** (Component)

```typescript
// ✅ Bước 1: Import hook
"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useFoods } from "@/hooks/useFoods";
import { ResultsDisplay } from "@/app/components/results-display";

// ✅ Bước 2: Filter state (từ URL params)
const filters: FilterParams = useMemo(() => 
  parseUrlParamsToFilters(searchParams), 
  [searchParams]
);
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 9;

// ✅ Bước 3: Gọi hook để lấy data
const { drinks, loading, error, totalPages } = useFoods(
  filters,
  currentPage,
  pageSize
);
// → drinks là array sản phẩm
// → loading là boolean
// → error là error string hoặc null
// → totalPages là số dùng cho pagination

// ✅ Bước 4: Return JSX
return (
  <main>
    <FilterSidebar ... />
    
    {/* Truyền data cho component con */}
    <ResultsDisplay
      loading={loading}        {/* ← Để show skeleton loading */}
      error={error}          {/* ← Để show error message */}
      results={drinks}       {/* ← Danh sách sản phẩm */}
      totalPages={totalPages}
      currentPage={currentPage}
      onPreviousPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
      onNextPage={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
    />
    
    <Footer />
  </main>
);
```

**Props ở đây:**
```javascript
// Props truyền vào ResultsDisplay
{
  loading: false,
  error: null,
  results: [
    { id: 1, name: "Cơm tấm", price: 50000, ... },
    { id: 2, name: "Bánh mì", price: 15000, ... }
  ],
  totalPages: 11,
  currentPage: 1,
  onPreviousPage: () => {...},
  onNextPage: () => {...}
}
```

---

### **Step 4️⃣: Render Grid Sản Phẩm (FILE LÀM THỨ 4)**

**File: `app/components/results-display.tsx`**

```typescript
// ✅ Bước 1: Nhận props từ component cha
interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  results: Drink[];           // ← Data từ hook
  resultCount?: string;
  emptyMessage?: string;
  showPagination?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  currentPage?: number;
  totalPages?: number;
  productType?: 'drink' | 'food' | 'fresh';
}

export function ResultsDisplay({
  loading,
  error,
  results,
  resultCount,
  // ... other props
}: ResultsDisplayProps) {
  // ✅ Bước 2: Kiểm tra loading
  if (loading) {
    return (
      <>
        {/* Hiển thị 9 skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  // ✅ Bước 3: Kiểm tra error
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <p className="text-red-700 font-bold">❌ Lỗi: {error}</p>
      </div>
    );
  }

  // ✅ Bước 4: Kiểm tra empty
  if (results.length === 0) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
        <p className="text-yellow-700 font-bold">{emptyMessage}</p>
      </div>
    );
  }

  // ✅ Bước 5: Render grid sản phẩm
  return (
    <>
      {resultCount && (
        <div className="mb-6">
          <p className="text-gray-600 font-semibold">{resultCount}</p>
        </div>
      )}

      {/* ← Grid chứa ProductCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product) => (
          // ✅ Truyền từng product vào ProductCard
          <ProductCard 
            key={product.id} 
            product={product} 
            type={productType} 
          />
        ))}
      </div>

      {/* Pagination buttons */}
      {showPagination && (
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onPreviousPage}>← Trước</button>
          <span>Trang {currentPage} / {totalPages}</span>
          <button onClick={onNextPage}>Sau →</button>
        </div>
      )}
    </>
  );
}
```

**Dữ liệu ở đây:**
```javascript
// Input props
{
  loading: false,
  error: null,
  results: [
    { id: 1, name: "Cơm tấm", price: 50000, ... },
    { id: 2, name: "Bánh mì", price: 15000, ... }
  ]
}

// Output: Map results thành ProductCard components
<ProductCard product={results[0]} />
<ProductCard product={results[1]} />
```

---

### **Step 5️⃣: Render Từng Sản Phẩm (FILE LÀM THỨ 5)**

**File: `app/components/product-card.tsx`**

```typescript
// ✅ Bước 1: Nhận product từ props
interface ProductCardProps {
  product: Product;  // ← Từng product từ results
  type: 'drink' | 'food' | 'fresh';
}

export default function ProductCard({ product, type }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  // ✅ Bước 2: Destructure product data
  const { id, name, imageUrl, featured, price } = product;

  // ✅ Bước 3: Render
  return (
    <Link href={`/${type}/${id}`}>
      <div className="relative bg-white rounded-2xl overflow-hidden">
        
        {/* Image */}
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src={imageUrl}  // ← Từ product
            alt={name}      // ← Từ product
            fill
            className="object-cover"
          />
          
          {/* Featured badge */}
          {featured && (  // ← Từ product
            <div className="absolute top-3 left-3 bg-red-500 text-white">
              Nổi bật
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-4">
          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
            className="flex justify-end"
          >
            <Heart fill={isFavorited ? "red" : "none"} />
          </button>

          {/* Name */}
          <h3 className="font-semibold">{name}</h3>

          {/* Price */}
          <p className="text-red-500 font-bold">
            ${price.toLocaleString()}  {/* ← Từ product */}
          </p>

          {/* Order button */}
          <button className="w-full bg-red-500 text-white mt-4">
            Đặt ngay
          </button>
        </div>
      </div>
    </Link>
  );
}
```

**Dữ liệu ở đây:**
```javascript
// Input product
{
  id: 1,
  name: "Cơm tấm",
  price: 50000,
  imageUrl: "https://res.cloudinary.com/...",
  featured: true,
  category: "RICE",
  // ...
}

// Output: HTML card
<div>
  <Image src="https://res.cloudinary.com/..." />
  <h3>Cơm tấm</h3>
  <p>$50,000</p>
  <button>Đặt ngay</button>
</div>
```

---

## 📋 Tóm Tắt - Thứ Tự Làm File

| Thứ tự | File | Vai trò | Làm gì |
|--------|------|---------|--------|
| **1️⃣** | `service/FoodService.ts` | Gọi API | `axios.get()` → trả về Promise |
| **2️⃣** | `hooks/useFoods.ts` | Quản lý state | Gọi service → `setState()` |
| **3️⃣** | `app/food/FoodPageClient.tsx` | Component | Gọi hook → nhận data → truyền props |
| **4️⃣** | `app/components/results-display.tsx` | UI grid | Nhận props → render grid ProductCard |
| **5️⃣** | `app/components/product-card.tsx` | UI item | Nhận product → render từng card |

---

## 🔄 Data Flow - Chi Tiết Giá Trị

```
┌─────────────────────────────────────────────────────────────┐
│ Backend: POST http://localhost:8080/api/foods/paging        │
│ Response: {                                                 │
│   data: [{id:1,name:"Cơm tấm",price:50000,...},...],       │
│   totalPages: 11,                                           │
│   hasNext: true, ...                                        │
│ }                                                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. FoodService.getAllFoodsPaginated()                         │
│    ↓ await axios.get()                                       │
│    ↓ return res.data                                         │
│    ↓ Promise<PaginatedFoodResponse>                          │
└────────────┬───────────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. useFoods Hook                                              │
│    ↓ const response = await FoodService.getAllFoodsPaginated()│
│    ↓ setFoods(response.data)  ← [Food, Food, ...]           │
│    ↓ setTotalPages(response.totalPages)  ← 11               │
│    ↓ setLoading(false)                                       │
│    return { foods, loading, error, totalPages }             │
└────────────┬───────────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. FoodPageClient Component                                   │
│    ↓ const { foods, loading, ... } = useFoods(...)          │
│    ↓ <ResultsDisplay                                         │
│        results={foods}  ← [Food, Food, ...]                 │
│        loading={loading}  ← false                            │
│      />                                                      │
└────────────┬───────────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. ResultsDisplay Component                                   │
│    ↓ {results.map(product => (                               │
│        <ProductCard product={product} />                     │
│      ))}                                                     │
└────────────┬───────────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. ProductCard Component                                      │
│    ↓ const { id, name, price } = product                    │
│    ↓ return (                                                │
│        <div>                                                 │
│          <img src={product.imageUrl} />                      │
│          <h3>{product.name}</h3>                             │
│          <p>${product.price}</p>                             │
│        </div>                                                │
│      )                                                       │
└──────────────────────────────────────────────────────────────┘
             │
             ↓
         🎨 UI Browser (Giao diện)
         ┌────────┐
         │ CƠMTẤM │ $50K
         ├────────┤
         │ BÁNH MÌ│ $15K
         └────────┘
```

---

## 💡 Logic Flow - State Changes

```
1. Component mount
   ↓
2. useFoods() chạy
   setLoading(true)
   ↓ (skeleton hiển thị)
   
3. FoodService.getAllFoodsPaginated() call API
   ↓ axios.get() → backend
   
4. Backend response
   ↓ res.data = { data: [...], totalPages: 11 }
   
5. Hook set state
   setFoods(response.data)    ← [Food[], Food[]]
   setTotalPages(11)
   setLoading(false)
   ↓
   
6. Component re-render
   loading = false
   foods = [Food[], Food[]]
   ↓ (skeleton disappear, grid appear)
   
7. results.map() render ProductCard
   ↓
   
8. UI show products
```

---

## 🚀 Nếu Thay Đổi Data

```
Khi nào re-fetch:
- Page thay đổi → dependency [page] → re-fetch
- Filters thay đổi → dependency [filters] → re-fetch
- pageSize thay đổi → dependency [pageSize] → re-fetch

Khi thay đổi any dependency:
useEffect(() => {
  fetchFoods()  // ← Chạy lại
}, [filters, page, pageSize])  // ← Nếu cái nào thay đổi
```

---

## ✅ Checklist - Làm đúng thứ tự

- [ ] **Bước 1**: Viết FoodService.ts với axios.get()
- [ ] **Bước 2**: Viết useFoods.ts hook để setState()
- [ ] **Bước 3**: Viết FoodPageClient.tsx để call hook
- [ ] **Bước 4**: Viết ResultsDisplay.tsx để render grid
- [ ] **Bước 5**: Viết ProductCard.tsx để render item
- [ ] **Test**: Kiểm tra API response ở Network tab
- [ ] **Debug**: Nếu lỗi, check hàng lần console.error()

---

## 🔧 Debugging Tips

```javascript
// Thêm log để debug flow
console.log("1. Service get response:", res.data)
console.log("2. Hook set foods:", foods)
console.log("3. Component receive props:", { loading, foods, error })

// Kiểm tra state change
useEffect(() => {
  console.log("Loading:", loading)
  console.log("Foods:", foods)
  console.log("Error:", error)
}, [loading, foods, error])

// Kiểm tra Network
// Chrome DevTools → Network tab → Tìm request /foods/paging
// Kiểm tra:
// - Status: 200 ✅
// - Response: { data: [...], totalPages: ... }
// - Headers: Content-Type: application/json
```

---

Hy vọng file này giúp bạn hiểu rõ data flow! 🎉
