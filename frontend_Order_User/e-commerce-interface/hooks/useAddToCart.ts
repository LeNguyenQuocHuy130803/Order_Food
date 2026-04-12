"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CartService } from "@/service/CartService"

export function useAddToCart() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      productType,
      productId,
      quantity,
    }: {
      productType: string
      productId: number
      quantity: number
    }) => {
      return CartService.addProductToCart(productType, productId, quantity)
    },
    onSuccess: () => {
      // ✅ Tự động invalidate và refetch cart query khi add thành công
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })

  return {
    addToCart: mutation.mutate,
    addToCartAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
