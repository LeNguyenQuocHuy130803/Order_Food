import type { Dessert, DessertFilterParams, PaginatedDessertResponse } from '@/types/dessert'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

/**
 * DessertService - Fetch dessert data from API
 * Dùng Fetch API - không cần auth token
 * 🔒 API sản phẩm công khai - không cần authentication
 */

/**
 * Get all desserts with pagination
 */
export const getAllDessertsPaginated = async (
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedDessertResponse> => {
  try {
    console.log(`🔍 [DessertService] Fetching desserts: page ${page}, pageSize ${pageSize}`)

    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
    })

    const res = await fetch(`${API_URL}/desserts/paging?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(error.message || 'Failed to fetch desserts')
    }

    const data = await res.json()
    console.log(`✅ [DessertService] Desserts fetched:`, {
      total: data.totalRecords,
      page: data.pageNumber,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    })

    return data
  } catch (error: any) {
    console.error('❌ [DessertService] Error in getAllDessertsPaginated:', error.message)
    throw error
  }
}

/**
 * Get dessert by ID
 */
export const getDessertById = async (dessertId: number): Promise<Dessert> => {
  try {
    console.log(`🔍 [DessertService] Fetching dessert ID: ${dessertId}`)

    const res = await fetch(`${API_URL}/desserts/${dessertId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(error.message || 'Failed to fetch dessert')
    }

    const data = await res.json()
    console.log(`✅ [DessertService] Dessert fetched:`, {
      id: data.id,
      name: data.name,
      price: data.price,
    })

    return data
  } catch (error) {
    console.error('❌ [DessertService] Error in getDessertById:', error)
    throw error
  }
}

/**
 * Search desserts by name/description
 */
export const searchDesserts = async (
  query: string,
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedDessertResponse> => {
  try {
    console.log(`🔍 [DessertService] Searching desserts: "${query}"`)

    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
      searchTerm: query,
    })

    const res = await fetch(`${API_URL}/foods/search?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(error.message || 'Failed to search desserts')
    }

    const data = await res.json()
    console.log(`✅ [DessertService] Search complete:`, data.totalRecords)

    return data
  } catch (error: any) {
    console.error('❌ [DessertService] Error in searchDesserts:', error.message)
    throw error
  }
}

/**
 * Filter desserts by criteria
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

    const res = await fetch(`${API_URL}/desserts/filter?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(error.message || 'Failed to filter desserts')
    }

    const data = await res.json()
    console.log(`✅ [DessertService] Filter complete:`, data.totalRecords)

    return data
  } catch (error: any) {
    console.error('❌ [DessertService] Error in filterDesserts:', error.message)
    throw error
  }
}

export const dessertService = {
  getAllDessertsPaginated,
  getDessertById,
  searchDesserts,
  filterDesserts,
}
