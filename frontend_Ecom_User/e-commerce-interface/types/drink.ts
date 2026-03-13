export interface Drink {
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

// Props cho DrinkCard component (kế thừa từ Drink)
export type DrinkCardProps = Drink;

export interface PaginatedDrinkResponse {
  data: Drink[]
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