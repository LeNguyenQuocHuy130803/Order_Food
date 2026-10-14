"use client"

import { useQuery } from "@tanstack/react-query"
import { CartService } from "@/service/CartService"
import { CartData } from "@/types/cart"
import { useAuth } from "@/hooks/useAuth"

export const CART_QUERY_KEY = ["cart"] as const

/**
 * 🛒 React Query Hook - Lấy giỏ hàng của user
 * ✅ Tự động kiểm tra đăng nhập qua useAuth (nếu không truyền tham số)
 * ✅ Chỉ fetch khi đã đăng nhập -> Không spam 401 với khách vãng lai
 * ✅ Auto-refresh token khi hết hạn
 * ✅ Cache data 5 phút
 */
export function useCartQuery(isAuthenticatedParam?: boolean) {
  const { isAuthenticated: authIsAuth } = useAuth()
  const canFetchCart = Boolean(isAuthenticatedParam !== undefined ? isAuthenticatedParam : authIsAuth)

  const { data, isLoading, error, refetch, isRefetching } = useQuery<CartData>({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      console.log(`🛒 [useCartQuery] Fetching cart...`)

      // ✅ Gọi CartService thay vì apiFetch trực tiếp
      const cartData = await CartService.getCart()

      console.log(`✅ [useCartQuery] Got cart:`, {
        cartId: cartData.id,
        itemCount: cartData.items?.length,
        totalPrice: cartData.totalPrice,
      })

      return cartData
    },
    // ✅ Luôn enable fetch - apiFetch sẽ auto-refresh token khi 401
    enabled: canFetchCart,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    refetchOnWindowFocus: false,
    retry: 2, // 🔄 Retry 2 lần nếu fail (cho token refresh time)
  })

  const cartItems = canFetchCart ? data?.items || [] : []

  return {
    cart: canFetchCart ? data : undefined,
    items: cartItems,
    itemCount: cartItems.length,
    totalPrice: canFetchCart ? data?.totalPrice || 0 : 0,
    loading: canFetchCart ? isLoading : false,
    error: canFetchCart ? error?.message || null : null,
    refetch,
    isRefetching,
  }
}
