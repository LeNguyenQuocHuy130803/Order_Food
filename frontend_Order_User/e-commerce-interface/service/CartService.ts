/**
 * Cart Service - Thêm sản phẩm vào giỏ hàng
 * 
 * ✅ Dùng fetch() từ api-client-refresh (có auto-refresh token)
 * ✅ Khi token hết hạn (401) → tự động gọi /api/auth/refresh
 * ✅ Tự động retry request sau khi token được refresh
 */

import { apiFetch } from '@/lib/api/api-client-refresh'

interface AddToCartRequest {
  productType: string  // 'FOOD' | 'DRINK' | 'FRESH'
  productId: number
  quantity: number
}

export interface CartResponse {
  id: number
  userId: number
  totalPrice: number
  items: {
    id: number
    productType: string
    productId: number
    productName: string
    priceAtTime: number
    quantity: number
    createdAt: string
    updatedAt: string
  }[]
  createdAt: string
  updatedAt: string
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param productType - 'FOOD' | 'DRINK' | 'FRESH'
 * @param productId - ID sản phẩm
 * @param quantity - Số lượng (mặc định 1)
 * @returns Cart data
 */
export async function addProductToCart(
  productType: string,
  productId: number,
  quantity: number = 1
): Promise<CartResponse> {
  try {
    console.log(`🛒 [CartService] Adding to cart:`, {
      productType,
      productId,
      quantity,
    })

    const payload: AddToCartRequest = {
      productType,
      productId,
      quantity,
    }

    // ✅ Dùng apiFetch (có auto-refresh token) - catch 401 + retry
    // Khi token hết hạn (401):
    //   - apiFetch sẽ gọi /api/auth/refresh để lấy token mới
    //   - Tự động retry request gốc
    const res = await apiFetch(
      '/api/carts/items',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Failed to add to cart')
    }

    const cartData = (await res.json()) as CartResponse

    console.log(`✅ [CartService] Add to cart success:`, {
      cartId: cartData.id,
      totalPrice: cartData.totalPrice,
      itemCount: cartData.items.length,
    })

    return cartData
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to add to cart'
    console.error(`❌ [CartService] Add to cart failed:`, {
      message: errorMsg,
      error,
    })
    throw new Error(errorMsg)
  }
}

export const CartService = {
  addProductToCart,
}
