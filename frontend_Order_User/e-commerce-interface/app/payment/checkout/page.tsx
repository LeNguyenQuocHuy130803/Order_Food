'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePayment } from '@/hooks/usePayment'
import { CreditCard } from 'lucide-react'
import { CircleX } from 'lucide-react'

function PaymentCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = parseInt(searchParams.get('orderId') || '0')



  const { createPayment, createPaymentLoading, error, setError } = usePayment()

  useEffect(() => {
    if (!orderId) {
      router.push('/cart')
      return
    }

  }, [orderId, router])

  const handlePayWithPayPal = async () => {
    try {
      setError(null)
      const response = await createPayment(orderId)

      if (response.approveUrl) {
        // Redirect to PayPal for approval
        window.location.href = response.approveUrl
      } else {
        setError('Failed to get PayPal approval URL')
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to initiate payment')
    }
  }

  const handleCancel = () => {
    router.push('/cart')
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Order</h1>
          <p className="text-gray-600 mb-6">Order not found. Please start from cart.</p>
          <button
            onClick={() => router.push('/cart')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Back to Cart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your payment securely</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold text-gray-900">#{orderId}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Status:</span>
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    PENDING
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <CircleX className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* PayPal Button */}
          <button
            onClick={handlePayWithPayPal}
            disabled={createPaymentLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 mb-4"
          >
            {createPaymentLoading ? (
              <>
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay with PayPal
              </>
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            disabled={createPaymentLoading}
            className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
          >
            Cancel
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              You will be redirected to PayPal to securely complete your payment. Your cart will be reserved for 30 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentCheckoutContent />
    </Suspense>
  )
}
