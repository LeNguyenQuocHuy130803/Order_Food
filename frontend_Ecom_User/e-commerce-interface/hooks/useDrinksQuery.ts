"use client";

import { useQuery } from "@tanstack/react-query";
import { DrinkService } from "@/service/DrinkService";
import type { Drink, PaginatedDrinkResponse, FilterParams } from "@/types/drink";

interface UseDrinksQueryResult {
  drinks: Drink[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  isRefetching: boolean;
}

/**
 * ✨ React Query Hook for Drinks
 * Automatically handles caching, deduplication, refetch
 */
export function useDrinksQuery(
  filters: FilterParams,
  page: number = 1,
  pageSize: number = 9
): UseDrinksQueryResult {
  
  const queryKey = ["drinks", { filters, page, pageSize }];

  const { data, isLoading, error, isRefetching } = useQuery<
    PaginatedDrinkResponse,
    Error
  >({
    queryKey,
    queryFn: async () => {
      if (Object.keys(filters).length > 0) {
        const filteredData = await DrinkService.filterDrinks(
          filters.categories,
          filters.featured,
          filters.unit,
          filters.minPrice,
          filters.maxPrice,
          filters.region
        );
        
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

      return DrinkService.getAllDrinksPaginated(page, pageSize);
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    drinks: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    totalPages: data?.totalPages || 0,
    isRefetching,
  };
}
