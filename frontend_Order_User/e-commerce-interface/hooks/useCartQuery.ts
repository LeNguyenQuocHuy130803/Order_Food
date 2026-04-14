"use client"

import { useQuery } from "@tanstack/react-query"
import { CartService } from "@/service/CartService"
import { CartData } from "@/types/cart"

/**
 * 🛒 React Query Hook - Lấy giỏ hàng của user
 * ✅ Auto-refresh token khi hết hạn
 * ✅ Cache data 5 phút
 * ✅ Chỉ fetch khi user đã authenticated
 * ✅ Không refetch khi focus window
 */
export function useCartQuery(isAuthenticated: boolean = false) {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<CartData>({
    queryKey: ["cart"],
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
    // 🔒 Chỉ enable query khi user đã authenticated
    // Nếu chưa login: query sẽ bị disable → không fetch → tránh 401 error
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    refetchOnWindowFocus: false,
  })

  return {
    cart: data,
    items: data?.items || [],
    itemCount: data?.items?.length || 0,
    totalPrice: data?.totalPrice || 0,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    isRefetching,
  }
}
