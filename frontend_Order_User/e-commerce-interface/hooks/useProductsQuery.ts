"use client"

import { useQuery } from '@tanstack/react-query'
import { ProductService, Product, ProductFilterParams, PaginatedProductResponse } from '@/service/ProductService'
import { ProductType } from '@/types/cart'

interface UseProductsQueryResult {
  products: Product[]
  loading: boolean
  error: string | null
  totalPages: number
  totalRecords: number
  isRefetching: boolean
}

export function useProductsQuery(
  filters: ProductFilterParams = {},
  page: number = 1,
  pageSize: number = 9
): UseProductsQueryResult {
  const queryKey = ['products', { filters, page, pageSize }]

  const { data, isLoading, error, isRefetching } = useQuery<PaginatedProductResponse, Error>({
    queryKey,
    queryFn: async () => {
      const hasFilter = Object.values(filters).some((val) => val !== undefined && val !== '')

      if (hasFilter) {
        const filteredList = await ProductService.filterProducts(filters)
        return {
          data: filteredList,
          pageNumber: 1,
          pageSize: filteredList.length,
          totalRecords: filteredList.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }
      }

      return ProductService.getProductsPaginated(filters.category, page, pageSize)
    },
    staleTime: 1000 * 60 * 5,
  })

  return {
    products: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    totalPages: data?.totalPages || 0,
    totalRecords: data?.totalRecords || 0,
    isRefetching,
  }
}
