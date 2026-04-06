/**
 * Dessert Types
 */

export interface Dessert {
  id: number
  name: string
  description: string
  price: number
  quantity: number
  imageUrl: string
  category: string
  featured: boolean
  unit: string
  region: string
  createdAt?: string
  updatedAt?: string
}

export interface DessertFilterParams {
  categories?: string[]
  featured?: boolean
  minPrice?: number
  maxPrice?: number
  unit?: string
  region?: string
}

export interface PaginatedDessertResponse {
  data: Dessert[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
