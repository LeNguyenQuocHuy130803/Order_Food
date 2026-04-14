import apiClient from '@/lib/apiClient'
import type { Dessert, DessertFilterParams, PaginatedDessertResponse } from '@/types/dessert'

/**
 * DessertService - Fetch dessert data from API
 * Dùng apiClient (axios) với auto-refresh token interceptor
 */

/**
 * Get all desserts with pagination
 * NOTE: Using /foods endpoint temporarily until /desserts backend endpoint is ready
 */
export const getAllDessertsPaginated = async (
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedDessertResponse> => {
  try {
    console.log(`🔍 [DessertService] Fetching desserts: page ${page}, pageSize ${pageSize}`)

    const res = await apiClient.get<PaginatedDessertResponse>(
      `/desserts/paging?pageNumber=${page}&pageSize=${pageSize}`
    )

    console.log(`✅ [DessertService] Desserts fetched:`, {
      total: res.data.totalRecords,
      page: res.data.pageNumber,
      pageSize: res.data.pageSize,
      totalPages: res.data.totalPages,
    })

    return res.data
  } catch (error) {
    console.error('❌ [DessertService] Error in getAllDessertsPaginated:', error)
    throw error
  }
}

/**
 * Get dessert by ID
 * NOTE: Using /foods endpoint temporarily until /desserts backend endpoint is ready
 */
export const getDessertById = async (dessertId: number): Promise<Dessert> => {
  try {
    console.log(`🔍 [DessertService] Fetching dessert ID: ${dessertId}`)

    const res = await apiClient.get<Dessert>(`/desserts/${dessertId}`)

    console.log(`✅ [DessertService] Dessert fetched:`, {
      id: res.data.id,
      name: res.data.name,
      price: res.data.price,
    })

    return res.data
  } catch (error) {
    console.error('❌ [DessertService] Error in getDessertById:', error)
    throw error
  }
}

/**
 * Search desserts by name/description
 * NOTE: Using /foods endpoint temporarily until /desserts backend endpoint is ready
 */
export const searchDesserts = async (
  query: string,
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedDessertResponse> => {
  try {
    console.log(`🔍 [DessertService] Searching desserts: "${query}"`)

    const res = await apiClient.get<PaginatedDessertResponse>(
      `/foods/search?pageNumber=${page}&pageSize=${pageSize}&searchTerm=${query}`
    )

    console.log(`✅ [DessertService] Search complete:`, res.data.totalRecords)

    return res.data
  } catch (error) {
    console.error('❌ [DessertService] Error in searchDesserts:', error)
    throw error
  }
}

/**
 * Filter desserts by criteria
 * NOTE: Using /foods endpoint temporarily until /desserts backend endpoint is ready
 */
export const filterDesserts = async (
  filters: DessertFilterParams
): Promise<PaginatedDessertResponse> => {
  try {
    console.log(`🔍 [DessertService] Filtering desserts:`, filters)

    const params = new URLSearchParams()

    if (filters.categories?.length) {
      filters.categories.forEach(cat => params.append('categories', cat))
    }
    if (filters.featured !== undefined) {
      params.append('featured', String(filters.featured))
    }
    if (filters.minPrice !== undefined) {
      params.append('minPrice', String(filters.minPrice))
    }
    if (filters.maxPrice !== undefined) {
      params.append('maxPrice', String(filters.maxPrice))
    }
    if (filters.unit) {
      params.append('unit', filters.unit)
    }
    if (filters.region) {
      params.append('region', filters.region)
    }

    const res = await apiClient.get<PaginatedDessertResponse>(
      `/foods/filter?${params.toString()}`
    )

    console.log(`✅ [DessertService] Filter complete:`, res.data.totalRecords)

    return res.data
  } catch (error) {
    console.error('❌ [DessertService] Error in filterDesserts:', error)
    throw error
  }
}

export const dessertService = {
  getAllDessertsPaginated,
  getDessertById,
  searchDesserts,
  filterDesserts,
}
