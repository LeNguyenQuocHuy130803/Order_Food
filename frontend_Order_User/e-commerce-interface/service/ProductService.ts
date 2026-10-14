import { apiFetch } from '@/lib/api/api-client-refresh'
import { ProductType } from '@/types/cart'

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  quantity: number
  imageUrl?: string
  category: ProductType
  featured?: boolean
  unit?: string
  region?: string
  createdAt?: string
  updatedAt?: string
}

export interface PaginatedProductResponse {
  data: Product[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ProductFilterParams {
  category?: ProductType
  featured?: boolean
  unit?: string
  minPrice?: number
  maxPrice?: number
  region?: string
  search?: string
}

export async function getProductsPaginated(
  category?: ProductType,
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedProductResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: pageSize.toString(),
  })

  if (category) {
    params.append('category', category)
  }

  const res = await apiFetch(`/api/products/paging?${params.toString()}`, {
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }

  return res.json()
}

export async function filterProducts(params: ProductFilterParams): Promise<Product[]> {
  const query = new URLSearchParams()

  if (params.category) query.append('category', params.category)
  if (params.featured !== undefined) query.append('featured', String(params.featured))
  if (params.unit) query.append('unit', params.unit)
  if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice))
  if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice))
  if (params.region) query.append('region', params.region)
  if (params.search) query.append('search', params.search)

  const res = await apiFetch(`/api/products?${query.toString()}`, {
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error('Failed to filter products')
  }

  return res.json()
}

export async function getProductById(id: number): Promise<Product> {
  const res = await apiFetch(`/api/products/${id}`, {
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch product with ID ${id}`)
  }

  return res.json()
}

export const ProductService = {
  getProductsPaginated,
  filterProducts,
  getProductById,
}
