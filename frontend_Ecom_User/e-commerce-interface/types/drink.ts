/**
 * Drink Types
 * Định nghĩa type cho dữ liệu từ backend API
 */

export type DrinkType = 'FEATURED' | 'NORMAL'

export interface Drink {
  id: number
  name: string
  description: string
  price: number
  quantity: number
  imageUrl: string
  category: string
  featured: boolean
  unit: string  // Đơn vị: BAG, BOTTLE, etc
  createdAt: string
  updatedAt: string
}

export interface DrinkCardProps extends Drink {
  // Props thêm cho hiển thị UI (random data)
  deliveryTime: string
  distance: string
  rating: number
}
