"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductService, Product, PaginatedProductResponse } from "@/service/ProductService";
import { PRODUCT_TYPES } from "@/types/cart";
import type { FilterParams } from "@/types/product";

interface UseFoodsQueryResult {
  foods: Product[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  isRefetching: boolean;
}

export function useFoodsQuery(
  filters: FilterParams = {},
  page: number = 1,
  pageSize: number = 9
): UseFoodsQueryResult {
  const queryKey = ["foods", { filters, page, pageSize }];

  const { data, isLoading, error, isRefetching } = useQuery<PaginatedProductResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (Object.keys(filters).length > 0) {
        const filteredData = await ProductService.filterProducts({
          category: PRODUCT_TYPES.FOOD,
          featured: filters.featured,
          unit: filters.unit,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          region: filters.region,
        });

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

      return ProductService.getProductsPaginated(PRODUCT_TYPES.FOOD, page, pageSize);
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    foods: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    totalPages: data?.totalPages || 0,
    isRefetching,
  };
}
