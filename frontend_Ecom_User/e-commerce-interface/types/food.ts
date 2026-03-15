export interface Food {
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


export interface PaginatedFoodResponse {
  data: Food[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Filter parameters (từ FilterSidebar)
export interface FilterParams {
  categories?: string[]
  featured?: boolean
  minPrice?: number
  maxPrice?: number
  unit?: string
  region?: string
}
