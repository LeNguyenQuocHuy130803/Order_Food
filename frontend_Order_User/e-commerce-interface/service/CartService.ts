/**
 * Cart Service - Thêm sản phẩm vào giỏ hàng + Lấy giỏ hàng
 * 
 * ✅ Dùng fetch() từ api-client-refresh (có auto-refresh token)
 * ✅ Khi token hết hạn (401) → tự động gọi /api/auth/refresh
 * ✅ Tự động retry request sau khi token được refresh
 */

import { apiFetch } from '@/lib/api/api-client-refresh'
import { AddToCartRequest, CartResponse, ProductType } from '@/types/cart'
import { authService } from '@/service/authService'

/**
 * Lấy giỏ hàng của user hiện tại
 * @returns Cart data
 */
export async function getCart(): Promise<CartResponse> {
  try {
    console.log(`🛒 [CartService] Fetching cart...`)

    const res = await apiFetch('/api/carts', {
      method: 'GET',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to get cart')
    }

    const cartData = (await res.json()) as CartResponse

    console.log(`✅ [CartService] Get cart success:`, {
      cartId: cartData.id,
      itemCount: cartData.items?.length,
      totalPrice: cartData.totalPrice,
      
    })

    return cartData
  } catch (error: unknown) {
    const errorMsg = (error as Error).message || 'Failed to get cart'
    console.log(`⚠️ [CartService] Get cart failed:`, {
      message: errorMsg,
      error,
    })
    throw new Error(errorMsg)
  }
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param productType - 'FOOD' | 'DRINK' | 'FRESH'
 * @param productId - ID sản phẩm
 * @param quantity - Số lượng (mặc định 1)
 * @returns Cart data
 */
export async function addProductToCart(
  productType: ProductType,
  productId: number,
  quantity: number = 1
): Promise<CartResponse> {
  try {
    if (!authService.isAuthenticated()) {
      throw new Error('Vui lòng đăng nhập để mua hàng!')
    }

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
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to add to cart')
    }

    const cartData = (await res.json()) as CartResponse

    console.log(`✅ [CartService] Add to cart success:`, {
      cartId: cartData.id,
      totalPrice: cartData.totalPrice,
      itemCount: cartData.items.length,
    })

    return cartData
  } catch (error: unknown) {
    const errorMsg = (error as Error).message || 'Failed to add to cart'
    console.log(`⚠️ [CartService] Add to cart failed:`, {
      message: errorMsg,
      error,
    })
    throw new Error(errorMsg)
  }
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param cartItemId - ID của item trong giỏ hàng
 * @param quantity - Số lượng mới
 * @returns Cart data
 */
export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number
): Promise<CartResponse> {
  try {
    if (!authService.isAuthenticated()) {
      throw new Error('Vui lòng đăng nhập để thao tác!')
    }

    console.log(`🛒 [CartService] Updating cart item quantity:`, {
      cartItemId,
      quantity,
    })

    // ✅ Dùng apiFetch (có auto-refresh token)
    const res = await apiFetch(
      `/api/carts/items/${cartItemId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      }
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to update quantity')
    }

    const cartData = (await res.json()) as CartResponse

    console.log(`✅ [CartService] Update quantity success:`, {
      cartId: cartData.id,
      totalPrice: cartData.totalPrice,
      itemCount: cartData.items.length,
    })

    return cartData
  } catch (error: unknown) {
    const errorMsg = (error as Error).message || 'Failed to update quantity'
    console.log(`⚠️ [CartService] Update quantity failed:`, {
      message: errorMsg,
      error,
    })
    throw new Error(errorMsg)
  }
}

/**
 * Xóa item khỏi giỏ hàng
 * @param cartItemId - ID của item trong giỏ hàng
 * @returns Cart data
 */
export async function removeCartItem(cartItemId: number): Promise<CartResponse> {
  try {
    console.log(`📡 [CartService] Removing item:`, { cartItemId })

    const res = await apiFetch(`/api/carts/items/${cartItemId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to remove item')
    }

    const cartData = (await res.json()) as CartResponse

    console.log(`✅ [CartService] Remove item success:`, {
      cartId: cartData.id,
      totalPrice: cartData.totalPrice,
      itemCount: cartData.items.length,
    })

    return cartData
  } catch (error: unknown) {
    const errorMsg = (error as Error).message || 'Failed to remove item'
    console.log(`⚠️ [CartService] Remove item failed:`, {
      message: errorMsg,
      error,
    })
    throw new Error(errorMsg)
  }
}

export const CartService = {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  removeCartItem,
}
