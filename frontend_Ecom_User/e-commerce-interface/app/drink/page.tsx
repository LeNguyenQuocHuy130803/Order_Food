"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FilterSidebar } from "../components/filter_sidebar";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import DrinkCard from "../components/drink_card";
import { DrinkService } from "@/service/DrinkService";
import type { DrinkCardProps, FilterParams } from "@/types/drink";

// ============================================
// Trang hiển thị danh sách Drinks
// Logic:
//   1. Gọi DrinkService.getAllDrinksPaginated() để lấy dữ liệu
//   2. Map dữ liệu với các thuộc tính random (deliveryTime, distance, rating)
//   3. Render qua DrinkCard component
// ============================================

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

// Helper: Convert URL params to FilterParams object
function parseUrlParamsToFilters(searchParams: URLSearchParams): FilterParams {
  const filters: FilterParams = {};
  
  const categories = searchParams.getAll('categories');
  if (categories.length > 0) {
    filters.categories = categories;
  }
  
  const featured = searchParams.get('featured');
  if (featured === 'true') {
    filters.featured = true;
  }
  
  const minPrice = searchParams.get('minPrice');
  if (minPrice) {
    filters.minPrice = parseInt(minPrice);
  }
  
  const maxPrice = searchParams.get('maxPrice');
  if (maxPrice) {
    filters.maxPrice = parseInt(maxPrice);
  }
  
  const unit = searchParams.get('unit');
  if (unit) {
    filters.unit = unit;
  }
  
  const region = searchParams.get('region');
  if (region) {
    filters.region = region;
  }
  
  return filters;
}

// Helper: Convert FilterParams to URL query string
function filtersToUrlParams(filters: FilterParams): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach(cat => params.append('categories', cat));
  }
  
  if (filters.featured) {
    params.set('featured', 'true');
  }
  
  if (filters.minPrice !== undefined) {
    params.set('minPrice', filters.minPrice.toString());
  }
  
  if (filters.maxPrice !== undefined) {
    params.set('maxPrice', filters.maxPrice.toString());
  }
  
  if (filters.unit) {
    params.set('unit', filters.unit);
  }
  
  if (filters.region) {
    params.set('region', filters.region);
  }
  
  return params;
}

export default function FoodPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [drinks, setDrinks] = useState<DrinkCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterParams>(() => {
    return parseUrlParamsToFilters(searchParams);
  });
  
  // Handle filter change: update both state AND URL
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    const queryParams = filtersToUrlParams(newFilters);
    const queryString = queryParams.toString();
    router.push(`/drink${queryString ? `?${queryString}` : ""}`);
  };

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Nếu có filter, gọi filterDrinks, nếu không gọi getAllDrinksPaginated
        let response;
        if (filters && Object.keys(filters).length > 0) {
          const filteredData = await DrinkService.filterDrinks(
            filters.categories,
            filters.featured,
            filters.unit,
            filters.minPrice,
            filters.maxPrice,
            filters.region
          );
          // Set dữ liệu filter (không phân trang)
          setDrinks(filteredData);
          setTotalPages(1);
        } else {
          // Gọi getAllDrinksPaginated nếu không có filter
          response = await DrinkService.getAllDrinksPaginated(
            currentPage,
            pageSize
          );
          setDrinks(response.data);
          setTotalPages(response.totalPages);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu";
        setError(errorMessage);
        console.error("Error fetching drinks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrinks();
  }, [currentPage, pageSize, filters]);

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12 pt-22">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">☕ Đồ Uống</h1>
          <p className="text-muted-foreground text-lg">
            Khám phá các loại đồ uống tươi mát từ các quán ăn hàng đầu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FilterSidebar onFilterChange={handleFilterChange} initialFilters={filters} />

          <div className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin">
                  <svg
                    className="w-12 h-12 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-semibold mb-2">❌ Lỗi tải dữ liệu</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && drinks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không có sản phẩm nào được tìm thấy
                </p>
              </div>
            )}

            {/* Drinks Grid */}
            {!isLoading && !error && drinks.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {drinks.map((drink) => (
                    <DrinkCard key={drink.id} {...drink} />
                  ))}
                </div>

                {/* Pagination Info - Hide nếu có filter */}
                {Object.keys(filters).length === 0 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </button>
                    <span className="text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
