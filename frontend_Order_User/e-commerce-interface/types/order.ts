/**
 * 🛒 Order Types
 */

export interface CreateOrderRequest {
  addressType?: string // "HOME", "WORK", etc. (optional)
  address?: string // Full address string (optional)
  notes?: string
  paymentMethod?: string
  cartItemIds?: number[]
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  priceAtTime: number
  imageUrl?: string
  productType?: string
  createdAt?: string
  updatedAt?: string
  price?: number
  image?: string
}

export interface Order {
  id: number
  userId: number
  status: string // "PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED", etc.
  paymentMethod?: string
  totalPrice: number
  address: string
  notes?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type CreateOrderResponse = Order

export interface GetOrdersResponse {
  data: Order[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  total?: number
  page?: number
  limit?: number
}

