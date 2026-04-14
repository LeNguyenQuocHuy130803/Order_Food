"use client";

import { useQuery } from "@tanstack/react-query";
import { FreshService } from "@/service/FreshService";
import type { Fresh, PaginatedFreshResponse, FilterParams } from "@/types/fresh";

interface UseFreshQueryResult {
  fresh: Fresh[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  isRefetching: boolean;
}

/**
 * ✨ React Query Hook for Fresh Products
 * Automatically handles caching, deduplication, refetch
 */
export function useFreshQuery(
  filters: FilterParams,
  page: number = 1,
  pageSize: number = 9
): UseFreshQueryResult {
  
  const queryKey = ["fresh", { filters, page, pageSize }];

  const { data, isLoading, error, isRefetching } = useQuery<
    PaginatedFreshResponse,
    Error
  >({
    queryKey,
    queryFn: async () => {
      if (Object.keys(filters).length > 0) {
        const filteredData = await FreshService.filterFresh(
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

      return FreshService.getAllFreshPaginated(page, pageSize);
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    fresh: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    totalPages: data?.totalPages || 0,
    isRefetching,
  };
}
