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
  isRefetching: boolean;
}

/**
 * ✨ React Query Hook - Thay thế cho useFoods
 * Tự động handle: caching, deduplication, refetch, error
 */
export function useFoodsQuery(
  filters: FilterParams,
  page: number = 1,
  pageSize: number = 9
): UseFoodsQueryResult {
  
  // Xác định query key (dùng để identify data khi có thay đổi)
  const queryKey = ["foods", { filters, page, pageSize }];

  // 🎯 useQuery tự động:
  // - Fetch data qua queryFn
  // - Cache result với key
  // - Dedup nếu có 2 component cần cùng data
  // - Handle refetch, refetchOnWindowFocus
  const { data, isLoading, error, isRefetching } = useQuery<
    PaginatedFoodResponse,
    Error
  >({
    queryKey,
    queryFn: async () => {
      // Nếu có filter → gọi filterFoods
      if (Object.keys(filters).length > 0) {
        const filteredData = await FoodService.filterFoods(
          filters.categories,
          filters.featured,
          filters.unit,
          filters.minPrice,
          filters.maxPrice,
          filters.region
        );
        
        // Convert filtered array về PaginatedFoodResponse format
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
    // Query chỉ chạy lại khi filters/page/pageSize thay đổi
    // Không cần manual useEffect dependency array!
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });

  return {
    foods: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    totalPages: data?.totalPages || 0,
    isRefetching,
  };
}
