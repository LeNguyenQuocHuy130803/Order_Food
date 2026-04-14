import { useQuery } from '@tanstack/react-query'
import { dessertService } from '@/service/DessertService'
import type { Dessert, DessertFilterParams, PaginatedDessertResponse } from '@/types/dessert'

interface UseDessertQueryResult {
  desserts: Dessert[]
  loading: boolean
  error: string | null
  totalPages: number
  isRefetching: boolean
}

/**
 * Hook để fetch desserts
 * Auto-cache: 5 phút
 * Auto-refetch nếu cần
 */
export function useDessertQuery(
  filters?: DessertFilterParams | null,
  page: number = 1,
  pageSize: number = 9
): UseDessertQueryResult {
  const { data, isLoading, error, isRefetching } = useQuery<PaginatedDessertResponse, Error>({
    queryKey: ['desserts', { filters, page, pageSize }],

    queryFn: async () => {
      // Nếu có filters
      if (filters && Object.keys(filters).length > 0) {
        return await dessertService.filterDesserts(filters)
      }

      // Mặc định: fetch all with pagination
      return await dessertService.getAllDessertsPaginated(page, pageSize)
    },

    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  })

  return {
    desserts: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    totalPages: data?.totalPages || 1,
    isRefetching,
  }
}
