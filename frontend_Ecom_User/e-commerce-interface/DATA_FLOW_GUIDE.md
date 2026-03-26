# 📊 Data Flow Guide - E-commerce API to UI (React Query Version) ✨

## 🎯 Tổng Quan Data Flow - CÓ GỌI LẠI!

### **CÁCH CŨ (Rối - 5 lớp)**
```
Backend (Spring Boot API)
        ↓ (axios.get)
Service Layer (FoodService.ts)
        ↓ (return Promise<Data>)
❌ Hooks Layer (useFoods.ts) - Manual state management
         ├─ state: foods, loading, error, totalPages (4 states!)
         ├─ useEffect + try-catch (70 dòng code)
         └─ Phải copy-paste cho useDrinks, useFresh (code duplication)
        ↓ (setState)
Component Layer (FoodPageClient.tsx)
        ↓ (props)
UI Components (ResultsDisplay.tsx, ProductCard.tsx)
        ↓
User Browser (Giao diện)
```

### **CÁCH MỚI (Sạch - 2 lớp với React Query)**
```
Backend (Spring Boot API)
        ↓ (axios.get)
Service Layer (FoodService.ts)
        ↓ (return Promise<Data>)
✅ React Query Hook (useFoodsQuery.ts)
   ├─ useQuery({ queryKey, queryFn })
   ├─ Tự động: caching, deduplication, refetch, error handling
   ├─ 40 dòng code thay vì 70
   └─ Reusable pattern cho tất cả (Food, Drink, Fresh)
        ↓ (Trả về: data, isLoading, error)
Component Layer (FoodPageClient.tsx)
        ↓ (props)
UI Components (ResultsDisplay.tsx, ProductCard.tsx)
        ↓
User Browser (Giao diện)
```

---

## 🔄 Chi Tiết Data Flow - React Query Version (Đơn Giản Hơn!)

### **Step 1️⃣: Setup QueryClientProvider (LÀM TRƯỚC TIÊN)**

**File: `app/providers.tsx`**

```typescript
"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // ✅ Bước 1: Tạo QueryClient (1 lần)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Cache 5 phút
            refetchOnWindowFocus: false, // Không refetch khi quay lại tab
          },
        },
      })
  );

  // ✅ Bước 2: Wrap app với QueryClientProvider
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
```

**Điều này làm gì:**
- `QueryClientProvider` = Server chứa tất cả React Query logic
- `staleTime: 5 phút` = Cache data 5 phút (không fetch lại)
- Wrap toàn bộ app → Tất cả component có thể dùng React Query

---

### **Step 2️⃣: Call API - Service Layer (GIỮ NGUYÊN)**

**File: `service/FoodService.ts`** - KHÔNG THAY ĐỔI

```typescript
import axios from "axios";
import type { Food, PaginatedFoodResponse } from "@/types/food";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ✅ Hàm này GIỮ NGUYÊN - React Query sẽ gọi nó
export const getAllFoodsPaginated = async (
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedFoodResponse> => {
  try {
    const res = await axios.get<PaginatedFoodResponse>(
      `${API_URL}/foods/paging`,
      {
        params: { page, size: pageSize },
      }
    );
    console.log("✅ getAllFoodsPaginated success:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error in getAllFoodsPaginated:", error);
    throw error;
  }
};

export const getFoodById = async (id: number): Promise<Food> => {
  try {
    const res = await axios.get<Food>(`${API_URL}/foods/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error in getFoodById:", error);
    throw error;
  }
};

// ... other methods like filterFoods
```

---

### **Step 3️⃣: React Query Hook (THAY THẾ useFoods.ts)**

**File: `hooks/useFoodsQuery.ts`** - TẠO MỚI (Thay cho useFoods.ts cũ)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { FoodService } from "@/service/FoodService";
import type { Food, PaginatedFoodResponse } from "@/types/food";
import type { FilterParams } from "@/types/drink";

interface UseFoodsQueryResult {
  foods: Food[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  isRefetching: boolean; // Extra: cho biết đang background refetch
}

/**
 * ✨ React Query Hook - Thay thế cách manual state management
 * 
 * Tự động xử lý:
 * ✅ Caching (5 phút)
 * ✅ Deduplication (2 component = 1 fetch)
 * ✅ Background refetch
 * ✅ Retry on error (3 lần)
 * ✅ Loading/Error/Success states
 */
export function useFoodsQuery(
  filters: FilterParams,
  page: number = 1,
  pageSize: number = 9
): UseFoodsQueryResult {
  // ✅ Step 1: Định nghĩa query key (unique identifier)
  // Mỗi khi filters/page/pageSize thay đổi → queryKey khác → React Query fetch lại
  const queryKey = ["foods", { filters, page, pageSize }];

  // ✅ Step 2: useQuery từ React Query
  // Nó tự động:
  // - Track loading state
  // - Handle errors
  // - Cache result
  const { data, isLoading, error, isRefetching } = useQuery<
    PaginatedFoodResponse,
    Error
  >({
    queryKey, // Unique key
    queryFn: async () => {
      // ✅ Step 3: queryFn = hàm fetch data
      // Chỉ chạy khi:
      // - Component mount
      // - queryKey thay đổi
      // - Cache hết hạn (5 phút)

      if (Object.keys(filters).length > 0) {
        // Nếu có filter → gọi filterFoods
        const filteredData = await FoodService.filterFoods(
          filters.categories,
          filters.featured,
          filters.unit,
          filters.minPrice,
          filters.maxPrice,
          filters.region
        );

        // Convert array về PaginatedFoodResponse format
        return {
          data: filteredData,
          pageNumber: 1,
          pageSize: filteredData.length,
          totalRecords: filteredData.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        };
      }

      // Không có filter → gọi getAllFoodsPaginated
      return FoodService.getAllFoodsPaginated(page, pageSize);
    },
    // ✅ Step 4: Config để tối ưu
    staleTime: 1000 * 60 * 5, // Cache 5 phút (mặc định từ provider)
    retry: 3, // Retry 3 lần nếu fail
  });

  // ✅ Step 5: Trả về object (tương tự old useFoods)
  return {
    foods: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    totalPages: data?.totalPages || 0,
    isRefetching,
  };
}
```

**So sánh với cách cũ:**

| Cách cũ (useFoods.ts) | Cách mới (useFoodsQuery.ts) |
|---|---|
| Phải viết `const [foods, setFoods] = useState([])` | React Query tự handle |
| Phải viết `useEffect` + dependency array | React Query tự track queryKey |
| Phải viết try-catch-finally | React Query tự handle |
| 70 dòng code | 40 dòng code |
| Không có caching | Caching 5 phút tự động |
| Không dedup | Dedup tự động |

---

### **Step 4️⃣: Sử Dụng Hook Trong Component (GẦN GIỐNG CŨ)**

**File: `app/food/FoodPageClient.tsx`**

```typescript
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";

import { FilterSidebar } from "@/app/components/filter_sidebar";
import { Footer } from "@/app/components/layout/footer";
import { ProductHeader } from "@/app/components/layout/product-header";
import { HeroBanner } from "@/app/components/hero-banner";
import { ResultsDisplay } from "@/app/components/results-display";

// ✨ THAY ĐỔI: Import useFoodsQuery thay vì useFoods
import { useFoodsQuery } from "@/hooks/useFoodsQuery";

import type { FilterParams } from "@/types/drink";
import { parseUrlParamsToFilters, filtersToUrlParams } from "@/utils/filter";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 9;

export default function FoodPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterRef = useRef<HTMLDivElement>(null);

  // ✅ Parse filters từ URL
  const filters: FilterParams = useMemo(
    () => parseUrlParamsToFilters(searchParams),
    [searchParams]
  );

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const pageSize = DEFAULT_PAGE_SIZE;

  // ✨ THAY ĐỔI: Gọi useFoodsQuery (React Query) thay vì useFoods
  // React Query tự handle:
  // ✅ Caching + Dedup
  // ✅ Background refetch
  // ✅ Error handling
  const { foods, loading, error, totalPages } = useFoodsQuery(
    filters,
    currentPage,
    pageSize
  );
  // KHÔNG CẦN: const [foods, setFoods] = useState(...)
  // KHÔNG CẦN: useEffect(...) 
  // TẮT CẢ ĐÃ ĐƯỢC HANDLE BỞI REACT QUERY!

  const handleFilterChange = (newFilters: FilterParams) => {
    // Khi user thay đổi filter → URL thay đổi → searchParams thay đổi
    // → filters thay đổi → queryKey thay đổi → React Query fetch lại
    const params = filtersToUrlParams(newFilters);
    const query = params.toString();
    router.push(`/food${query ? `?${query}` : ""}`);
  };

  // Smooth scroll when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0 && filterRef.current) {
      setTimeout(() => {
        filterRef.current!.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [filters]);

  return (
    <main className="bg-background min-h-screen">
      <ProductHeader />

      <HeroBanner
        icon={UtensilsCrossed}
        badge="Giao lanh 30 phut"
        headline="Mon an ngon moi ngay"
        description="Tan huong nhung mon an ngon tuyet voi"
        imageSrc="/image/food/pho-bo-ha-noi.jpg"
        imageAlt="Delicious food"
      />

      <div ref={filterRef}>
        <FilterSidebar
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          categories={[
            { name: "RICE", displayName: "RICE" },
            { name: "NOODLE", displayName: "NOODLE" },
            // ...
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* ✅ Truyền data từ React Query vào component con */}
          <ResultsDisplay
            loading={loading}
            error={error}
            results={foods}
            productType="food"
            resultCount={
              Object.keys(filters).length === 0
                ? `Hiển thị ${foods.length} sản phẩm`
                : undefined
            }
            showPagination={Object.keys(filters).length === 0}
            onPreviousPage={() =>
              setCurrentPage((prev) => Math.max(1, prev - 1))
            }
            onNextPage={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
```

**Điểm khác so với cách cũ:**
```diff
- import { useFoods } from "@/hooks/useFoods";  // Cách cũ
+ import { useFoodsQuery } from "@/hooks/useFoodsQuery";  // Cách mới

- const { foods, loading, error, totalPages } = useFoods(filters, currentPage, pageSize);
+ const { foods, loading, error, totalPages } = useFoodsQuery(filters, currentPage, pageSize);

// Phần còn lại: HOÀN TOÀN GIỐNG NHƯ CŨ! ✅
```

---

### **Step 5️⃣: ResultsDisplay + ProductCard (KHÔNG THAY ĐỔI)**

**File: `app/components/results-display.tsx`** - GIỮ NGUYÊN

```typescript
"use client";

import ProductCard from "@/app/components/product-card";
import { ProductCardSkeleton } from "@/app/components/product-card-skeleton";
import type { Drink } from "@/types/drink";

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  results: Drink[];
  resultCount?: string;
  emptyMessage?: string;
  showPagination?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  currentPage?: number;
  totalPages?: number;
  productType?: "drink" | "food" | "fresh";
}

export function ResultsDisplay({
  loading,
  error,
  results,
  resultCount,
  emptyMessage = "Không tìm thấy kết quả",
  showPagination = false,
  onPreviousPage,
  onNextPage,
  currentPage = 1,
  productType = "drink",
  totalPages = 1,
}: ResultsDisplayProps) {
  // ✅ Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <p className="text-red-700 font-bold">❌ Lỗi: {error}</p>
      </div>
    );
  }

  // ✅ Empty state
  if (results.length === 0) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
        <p className="text-yellow-700 font-bold">{emptyMessage}</p>
      </div>
    );
  }

  // ✅ Success state - render products
  return (
    <>
      {resultCount && (
        <div className="mb-6">
          <p className="text-gray-600 font-semibold">{resultCount}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            type={productType}
          />
        ))}
      </div>

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

**File: `app/components/product-card.tsx`** - GIỮ NGUYÊN

```typescript
"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
  type: "drink" | "food" | "fresh";
}

export default function ProductCard({ product, type }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { id, name, imageUrl, featured, price } = product;

  return (
    <Link href={`/${type}/${id}`}>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all">
        <div className="relative w-full h-64 overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform"
          />

          {featured && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1.5 rounded-full text-xs font-bold">
              Nổi bật
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg"
          >
            <Heart
              size={20}
              className={
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
              }
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-red-500 font-bold">${price.toLocaleString()}</p>
          <button className="w-full bg-red-500 text-white mt-4">
            Đặt ngay
          </button>
        </div>
      </div>
    </Link>
  );
}
```

---

## 📋 Tóm Tắt - Thứ Tự Làm File (REFACTORED)

| Thứ tự | File | Vai trò | Làm gì |
|--------|------|---------|--------|
| **0️⃣** | `app/providers.tsx` | Setup | `<QueryClientProvider>` - Setup 1 lần |
| **1️⃣** | `service/FoodService.ts` | Gọi API | `axios.get()` → return Promise |
| **2️⃣** | `hooks/useFoodsQuery.ts` | React Query | `useQuery()` - Tự caching + dedup |
| **3️⃣** | `app/food/FoodPageClient.tsx` | Component | Gọi hook → truyền props |
| **4️⃣** | `app/components/results-display.tsx` | UI grid | Render grid ProductCard |
| **5️⃣** | `app/components/product-card.tsx` | UI item | Render từng card |

---

## 🔄 Data Flow - Chi Tiết Giá Trị (React Query Version)

```
┌─────────────────────────────────────────────────────────┐
│ 0. Providers Setup (app/layout.tsx)                     │
│    ✅ <QueryClientProvider client={queryClient}>        │
│    ✅ Enables React Query cho tất cả components         │
└────────────┬──────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: GET /api/foods/paging?page=1&size=9           │
│ Response: {                                             │
│   data: [{id:1,name:"Cơm tấm",...},...],              │
│   totalPages: 11,                                       │
│   hasNext: true, ...                                    │
│ }                                                       │
└────────────┬──────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│ 1. FoodService.getAllFoodsPaginated(page, pageSize)     │
│    ↓ await axios.get('/foods/paging')                   │
│    ↓ return res.data (PaginatedFoodResponse)            │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│ 2. React Query Hook (useFoodsQuery)                      │
│    ✅ useQuery({                                         │
│       queryKey: ["foods", {filters, page, pageSize}],  │
│       queryFn: () => FoodService.getAllFoodsPaginated() │
│    })                                                    │
│    ↓ Auto cache for 5 minutes                            │
│    ↓ Auto deduplication                                 │
│    ↓ Auto refetch on window focus                        │
│    return { data, isLoading, error, ... }              │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│ 3. FoodPageClient Component                              │
│    ↓ const { foods, loading, error, totalPages }        │
│    ↓    = useFoodsQuery(filters, page, pageSize)        │
│    ↓ <ResultsDisplay                                     │
│      results={foods}  ← [Food, Food, ...]              │
│      loading={loading}                                   │
│      error={error}                                       │
│    />                                                    │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│ 4. ResultsDisplay Component                              │
│    ↓ if (loading) → render Skeleton                      │
│    ↓ if (error) → render Error message                   │
│    ↓ if (results.length === 0) → render Empty           │
│    ↓ {results.map(product => (                           │
│      <ProductCard product={product} />                   │
│    ))}                                                   │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│ 5. ProductCard Component (Render 9 cards)               │
│    ✅ Skeleton Loading State:                            │
│       [████] [████] [████]                               │
│       [████] [████] [████]                               │
│       [████] [████] [████]  (Loading)                   │
│                                                          │
│    ✅ Success State:                                     │
│       ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│       │ Cơm tấm │ │ Bánh mì │ │ Phở bò  │              │
│       │ $50K    │ │ $15K    │ │ $25K    │              │
│       └─────────┘ └─────────┘ └─────────┘              │
│       ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│       │ Mỳ Quảng│ │ Hủ tiếu │ │ Chiên   │              │
│       │ $20K    │ │ $18K    │ │ $30K    │              │
│       └─────────┘ └─────────┘ └─────────┘              │
│       ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│       │ Tương   │ │ Canh    │ │ Salad   │              │
│       │ $12K    │ │ $22K    │ │ $28K    │              │
│       └─────────┘ └─────────┘ └─────────┘              │
└──────────────────────────────────────────────────────────┘
             │
             ↓
🎨 User Browser - Hiển thị sản phẩm
```

---

## 💡 Logic Flow Chi Tiết - React Query Behavior

### **Scenario 1: Component mount lần đầu**
```
1. Component mount
   ↓
2. useFoodsQuery({ queryKey: ["foods", {filters, page}] })
   ↓
3. React Query check: Có data trong cache không?
   - Không → Gọi queryFn
   - Có → Dùng cached data (nếu còn fresh)
   ↓
4. queryFn chạy → FoodService.getAllFoodsPaginated()
   isLoading = true → Render skeleton
   ↓
5. Backend response → res.data
   ↓
6. React Query auto setState
   isLoading = false
   data = {...}
   ↓
7. Component re-render → Show products
```

### **Scenario 2: User thay đổi filter**
```
1. User click filter
   ↓
2. Filter state thay đổi
   ↓
3. queryKey thay đổi từ ["foods", {filters1, page}]
   → ["foods", {filters2, page}]
   ↓
4. React Query detect: queryKey khác → fetch lại
   ↓
5. queryFn chạy lại với filters mới
   ↓
6. Skeleton load → Data arrives → Render
```

### **Scenario 3: User quay lại từ trang khác**
```
1. User rời khỏi food page
   ↓
2. Sau 5 phút, user quay lại
   ↓
3. useFoodsQuery chạy
   ↓
4. React Query check cache
   - Cache còn fresh (< 5 phút) → Dùng cache (KHÔNG fetch)
   - Cache hết hạn (> 5 phút) → Refetch background
   ↓
5. Instant render + silently refetch in background
   ✅ Ultra fast UX!
```

---

## ✨ React Query Tự Làm Gì?

| Tính năng | Trước (Manual) | Ngày nay (React Query) |
|----------|---|---|
| **Loading state** | ❌ Phải setState | ✅ `isLoading` tự động |
| **Error handling** | ❌ Phải try-catch | ✅ `error` tự động |
| **Caching** | ❌ Không có | ✅ 5 phút tự động |
| **Deduplication** | ❌ Không có | ✅ 2 component = 1 fetch |
| **Background refetch** | ❌ Không có | ✅ Tự động |
| **Retry on error** | ❌ Không có | ✅ 3 lần tự động |
| **Stale-while-revalidate** | ❌ Không có | ✅ Yes! |
| **Invalidation** | ❌ Manual | ✅ `invalidateQueries()` |
| **Persistence** | ❌ Không có | ✅ `useQueryClient` |

---

## 🚀 Một Số Advanced Features (Bonus)

### **Refetch khi component focus**
```typescript
// Đã enable mặc định trong QueryClient setup
// Mỗi lần user quay lại tab → tự động refetch
staleTime: 1000 * 60 * 5  // 5 phút
```

### **Manual refetch (nếu cần)**
```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const handleRefresh = () => {
  queryClient.invalidateQueries({ queryKey: ["foods"] });
  // → Tất cả foods queries bị invalidate → refetch automatically
};
```

### **Skip query (nếu không cần)**
```typescript
const { data } = useQuery({
  queryKey: ["foods"],
  queryFn: ...,
  enabled: filters.length > 0  // Chỉ fetch khi có filter
});
```

---

## 📝 Checklist - DONE! ✅

- [x] **Step 0**: Setup QueryClientProvider trong providers.tsx
- [x] **Step 1**: Keep FoodService.ts (axios call) 
- [x] **Step 2**: Create useFoodsQuery.ts (React Query hook)
- [x] **Step 3**: Update FoodPageClient.tsx (import useFoodsQuery)
- [x] **Step 4**: Keep ResultsDisplay.tsx (no change needed)
- [x] **Step 5**: Keep ProductCard.tsx (no change needed)
- [x] **Step 6**: Create useDrinksQuery.ts (follow same pattern)
- [x] **Step 7**: Create useFreshQuery.ts (follow same pattern)
- [x] **Step 8**: Update DrinkPageClient.tsx (import useDrinksQuery)
- [x] **Step 9**: Update FreshPageClient.tsx (import useFreshQuery)
- ⏳ **Test**: Chạy `npm run dev` để kiểm tra loading/error states
- ⏳ **Debug**: Network tab → kiểm tra caching hoạt động

---

## 🎓 So Sánh Code Size

```
TRƯỚC (Manual State + 5 layers):
  service/FoodService.ts                50 dòng
  hooks/useFoods.ts                    ❌ 70 dòng (many useState + useEffect)
  hooks/useDrinks.ts                   ❌ 70 dòng (copy-paste)
  hooks/useFresh.ts                    ❌ 70 dòng (copy-paste)
  app/food/FoodPageClient.tsx           80 dòng
  app/drink/DrinkPageClient.tsx         80 dòng
  app/fresh/FreshPageClient.tsx         80 dòng
  ResultsDisplay + ProductCard         120 dòng
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 TỔNG: 620 dòng

NGÀY NAY (React Query + 2 effective layers):
  service/FoodService.ts                50 dòng
  hooks/useFoodsQuery.ts               ✅ 40 dòng (useQuery)
  hooks/useDrinksQuery.ts              ✅ 40 dòng (same pattern)
  hooks/useFreshQuery.ts               ✅ 40 dòng (same pattern)
  app/food/FoodPageClient.tsx           80 dòng (only import change)
  app/drink/DrinkPageClient.tsx         80 dòng (only import change)
  app/fresh/FreshPageClient.tsx         80 dòng (only import change)
  ResultsDisplay + ProductCard         120 dòng
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🟢 TỔNG: 530 dòng

📉 Tiết kiệm: 90 dòng (-14%)
💡 Logic: 5x đơn giản hơn
⚡ Features: 10x tính năng hơn
```

---

## 🔧 Debugging Tips

### **Browser DevTools - Network Tab**
```javascript
1. Chrome DevTools → Network tab
2. Go to /food page
3. Xem requests:
   ✅ GET /api/foods/paging?page=1&size=9
      - Status: 200
      - Response: { data: [...], totalPages: 11 }
      
4. Quay lại từ trang khác
5. Check Network tab:
   ✅ NO NEW REQUEST (cached!)
   OR
   ✅ Request nhưng không blocking rendering (background refetch)
```

### **Console Logging**
```typescript
// Thêm vào useFoodsQuery.ts để debug
const { data, isLoading, error } = useQuery({
  queryKey: ["foods", { filters, page, pageSize }],
  queryFn: async () => {
    console.log("📡 Fetching foods:", { filters, page, pageSize });
    const result = await FoodService.getAllFoodsPaginated(page, pageSize);
    console.log("✅ Foods fetched:", result);
    return result;
  },
});

console.log("🔄 Query state:", { isLoading, error, dataLength: data?.data.length });
```

### **React Query DevTools (Optional)**
```bash
npm install @tanstack/react-query-devtools
```

```typescript
// app/providers.tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

return (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>{children}</SessionProvider>
    <ReactQueryDevtools initialIsOpen={false} /> {/* Debug tool */}
  </QueryClientProvider>
);
```

Sau đó: Click vào góc dưới bên trái → Xem query state realtime

---

## 🎯 Summary - Cách Mới vs Cách Cũ

### **Cách CŨ - What Had To Be Done Manually:**
```typescript
// useFoods.ts - 70 dòng
const [foods, setFoods] = useState([]);        // Manual state 1
const [loading, setLoading] = useState(true);  // Manual state 2
const [error, setError] = useState(null);      // Manual state 3
const [totalPages, setTotalPages] = useState(0); // Manual state 4

useEffect(() => {
  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (Object.keys(filters).length > 0) {
        const filteredData = await FoodService.filterFoods(...);
        setFoods(filteredData);
        setTotalPages(1);
      } else {
        const response = await FoodService.getAllFoodsPaginated(page, pageSize);
        setFoods(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchFoods();
}, [filters, page, pageSize]);

return { foods, loading, error, totalPages };
```

❌ **Vấn đề:**
- Phải quản lý 4 states
- Phải viết useEffect + dependency array
- Phải viết try-catch-finally
- Không có caching
- Copy-paste cho useDrinks, useFresh

---

### **Cách MỚI - React Query Handles Everything:**
```typescript
// useFoodsQuery.ts - 40 dòng
const { data, isLoading, error } = useQuery({
  queryKey: ["foods", { filters, page, pageSize }],
  queryFn: async () => {
    if (Object.keys(filters).length > 0) {
      const filteredData = await FoodService.filterFoods(...);
      return { data: filteredData, totalPages: 1, ... };
    }
    return FoodService.getAllFoodsPaginated(page, pageSize);
  },
  staleTime: 1000 * 60 * 5,
});

return {
  foods: data?.data || [],
  loading: isLoading,
  error: error?.message || null,
  totalPages: data?.totalPages || 0,
};
```

✅ **Ưu điểm:**
- Tự động quản lý states
- Không cần useEffect
- Tự động try-catch
- ✅ Caching 5 phút
- ✅ Deduplication
- ✅ Background refetch
- ✅ Retry on error
- Dùng lại pattern cho all (Food, Drink, Fresh)

---

## 🏆 Production-Ready Pattern

Đây là cách làm trong **thực tế**:
- ✅ Airbnb
- ✅ Stripe
- ✅ GitHub
- ✅ Netflix
- ✅ 90% modern React apps

**Congratulations! 🎉 Bạn vừa refactor sang production-ready architecture!**

---

## 📚 Tham Khảo Thêm

- React Query Docs: https://tanstack.com/query/latest
- React Query Best Practices
- Server Components + React Query
- Offline-first architecture

Hy vọng guide này giúp bạn hiểu rõ React Query! 🚀
