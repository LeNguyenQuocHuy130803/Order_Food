'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  checkoutOrder,
  createPaypalOrder,
  capturePaypalOrder,
  getPaymentHistory,
} from '@/service/PaymentService'
import { PaymentHistoryDto, OrderCheckoutResponse, CreatePaymentResponse, CapturePaymentResponse, CheckoutOrderRequest } from '@/types/payment'

/**
 * Hook to manage payment flow
 */
export function usePayment() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Checkout mutation
  const checkoutMutation = useMutation<OrderCheckoutResponse, Error, CheckoutOrderRequest | { shippingAddressId?: number; selectedItemIds?: number[] } | undefined>({
    mutationFn: (params) => {
      if (params && ('address' in params || 'addressType' in params || 'cartItemIds' in params)) {
        return checkoutOrder(params as CheckoutOrderRequest)
      }
      const legacyParams = params as { shippingAddressId?: number; selectedItemIds?: number[] } | undefined
      return checkoutOrder(legacyParams?.shippingAddressId, legacyParams?.selectedItemIds)
    },
    onSuccess: () => {
      console.log('✅ Checkout success')
      setError(null)
    },
    onError: (err: unknown) => {
      const message = (err as Error).message || 'Checkout failed'
      console.error('❌ Checkout error:', message)
      setError(message)
    },
  })

  // Create payment mutation
  const createPaymentMutation = useMutation<CreatePaymentResponse, Error, number>({
    mutationFn: (orderId: number) => createPaypalOrder(orderId),
    onSuccess: () => {
      console.log('✅ Payment created')
      setError(null)
    },
    onError: (err: unknown) => {
      const message = (err as Error).message || 'Failed to create payment'
      console.error('❌ Create payment error:', message)
      setError(message)
    },
  })

  // Capture payment mutation
  const capturePaymentMutation = useMutation<CapturePaymentResponse, Error, string>({
    mutationFn: (paypalOrderId: string) => capturePaypalOrder(paypalOrderId),
    onSuccess: () => {
      console.log('✅ Payment captured')
      setError(null)
      setSuccess(true)
    },
    onError: (err: unknown) => {
      const message = (err as Error).message || 'Failed to capture payment'
      console.error('❌ Capture payment error:', message)
      setError(message)
    },
  })

  const createPayment = useCallback(
    async (orderId: number) => {
      try {
        const response = await createPaymentMutation.mutateAsync(orderId)
        return response
      } catch (err) {
        throw err
      }
    },
    [createPaymentMutation]
  )

  const capturePayment = useCallback(
    async (paypalOrderId: string) => {
      try {
        const response = await capturePaymentMutation.mutateAsync(paypalOrderId)
        return response
      } catch (err) {
        throw err
      }
    },
    [capturePaymentMutation]
  )

  const checkout = useCallback(
    async (shippingAddressId?: number, selectedItemIds?: number[]) => {
      try {
        const response = await checkoutMutation.mutateAsync({ shippingAddressId, selectedItemIds })
        return response
      } catch (err) {
        throw err
      }
    },
    [checkoutMutation]
  )

  return {
    // Checkout
    checkout,
    checkoutLoading: checkoutMutation.isPending,
    checkoutError: checkoutMutation.error?.message,

    // Payment
    createPayment,
    createPaymentLoading: createPaymentMutation.isPending,
    createPaymentError: createPaymentMutation.error?.message,

    // Capture
    capturePayment,
    capturePaymentLoading: capturePaymentMutation.isPending,
    capturePaymentError: capturePaymentMutation.error?.message,

    // General
    error,
    success,
    setError,
    setSuccess,
  }
}

/**
 * Hook to fetch payment history
 */
export function usePaymentHistory() {
  const { data: payments = [], isLoading, error, refetch } = useQuery<PaymentHistoryDto[], Error>({
    queryKey: ['paymentHistory'],
    queryFn: () => getPaymentHistory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  return {
    payments,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  }
}
