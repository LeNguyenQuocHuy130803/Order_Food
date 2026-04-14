/**
 * Cart Types and Interfaces
 */

export interface AddToCartRequest {
  productType: string  // 'FOOD' | 'DRINK' | 'FRESH'
  productId: number
  quantity: number
}

export interface CartItem {
  id: number
  productType: string
  productId: number
  productName: string
  imageUrl: string
  priceAtTime: number
  quantity: number
  availableQuantity?: number  // 🔒 Max có sẵn từ backend
  createdAt: string
  updatedAt: string
}

export interface CartResponse {
  id: number
  userId: number
  totalPrice: number
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

// CartData is an alias for CartResponse
export type CartData = CartResponse
