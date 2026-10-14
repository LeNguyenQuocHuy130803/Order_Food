"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast, Toaster } from "sonner"
import { ProductHeader } from "@/app/components/layout/product-header"
import { Footer } from "@/app/components/layout/footer"
import { AddressSelector } from "@/app/components/checkout/AddressSelector"
import { OrderSummary } from "@/app/components/checkout/OrderSummary"
import { PaymentMethodSelector, PaymentMethod } from "@/app/components/checkout/PaymentMethodSelector"
import { useCartQuery } from "@/hooks/useCartQuery"
import { useAddresses } from "@/hooks/useAddresses"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { OrderService } from "@/service/OrderService"
import { createPaypalOrder } from "@/service/PaymentService"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useRequireAuth('/login-page')
  const { items, loading: cartLoading } = useCartQuery(isAuthenticated)
  const { addresses } = useAddresses()
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  // ✅ Load selectedAddressId from sessionStorage on mount
  useEffect(() => {
    const STORAGE_KEY = "checkout_selectedAddressId"
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      setSelectedAddressId(parseInt(saved, 10))
    }
  }, [])

  // ✅ Parse selected item IDs từ URL search params
  useEffect(() => {
    const selectedParam = searchParams.get("selected")
    if (selectedParam) {
      try {
        const ids = JSON.parse(selectedParam)
        setSelectedItemIds(new Set(ids))
        console.log("✅ Parsed selected items from URL:", ids)
      } catch (error) {
        console.error("Failed to parse selected items:", error)
      }
    }
  }, [searchParams])

  // 📊 Lọc sản phẩm được chọn
  const selectedItems = items.filter(item => selectedItemIds.has(item.id))
  
  // 💰 Tính tổng tiền
  const totalPrice = selectedItems.reduce((sum, item) => {
    return sum + (item.priceAtTime * item.quantity)
  }, 0)

  // 📍 Get display address (same logic as AddressSelector)
  const displayAddress = addresses.find(addr => {
    if (selectedAddressId !== null) {
      return addr.id === selectedAddressId
    }
    return addr.isDefault === true
  })

  // 🛒 Handle checkout
  const handleCheckout = async () => {
    try {
      if (!displayAddress || selectedItems.length === 0) {
        toast.error("Vui lòng chọn địa chỉ và sản phẩm")
        return
      }

      setIsProcessing(true)
      console.log("🛒 [Checkout] Starting checkout process...", {
        addressType: displayAddress.type,
        itemsCount: selectedItems.length,
        paymentMethod,
        totalPrice,
      })

      // 1️⃣ Tạo đơn hàng
      const order = await OrderService.createOrder({
        addressType: displayAddress.type,
        address: displayAddress.address,
        notes: "Giao nhanh vào sáng sôm nhé!",
      })

      console.log("✅ Order created:", order)

      // 2️⃣ Nếu PayPal → tạo payment link
      if (paymentMethod === "paypal") {
        const payment = await createPaypalOrder(order.id)
        console.log("✅ PayPal payment created:", payment)
        
        // 3️⃣ Xóa cart items trước khi redirect
        for (const item of selectedItems) {
          try {
            await fetch(`/api/carts/${item.id}`, {
              method: 'DELETE',
            })
          } catch (err) {
            console.warn(`❌ Failed to delete cart item ${item.id}:`, err)
          }
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem("checkout_selectedAddressId")
        
        // Redirect to PayPal
        if (payment.approveUrl) {
          // eslint-disable-next-line react-hooks/immutability
          window.location.href = payment.approveUrl
        }
      } else if (paymentMethod === "cash") {
        // 2️⃣ Xóa items đã đặt khỏi cart
        for (const item of selectedItems) {
          try {
            await fetch(`/api/carts/${item.id}`, {
              method: 'DELETE',
            })
          } catch (err) {
            console.warn(`❌ Failed to delete cart item ${item.id}:`, err)
          }
        }

        // 3️⃣ Clear sessionStorage
        sessionStorage.removeItem("checkout_selectedAddressId")
        setSelectedItemIds(new Set())

        // 4️⃣ Show success message
        toast.success(`Tạo thành công đơn hàng với id : ${order.id}. Vui lòng chuẩn bị tiền mặt khi nhận hàng!`, {
          duration: 5000, // ✅ Hiển thị toast 5 giây
        })

        // 5️⃣ Redirect về cart sau 3 giây (cho user nhìn thấy toast)
        setTimeout(() => {
          router.push("/cart")
        }, 5000)

        setIsProcessing(false)
      }
    } catch (error: unknown) {
      console.error("❌ [Checkout] Error:", error)
      toast.error(`Lỗi: ${(error as Error).message}`)
      setIsProcessing(false)
    }
  }

  if (cartLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <ProductHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24 flex justify-center items-center min-h-screen">
          <div className="animate-spin">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      </main>
    )
  }

  if (selectedItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <ProductHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-600 font-semibold text-lg mb-4">
              ❌ Không có sản phẩm nào để thanh toán
            </p>
            <button
              onClick={() => {
                toast.info("Quay lại giỏ hàng")
                router.back()
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              Quay Lại Giỏ Hàng
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ProductHeader />

      <div className="max-w-7xl mx-auto px-4 py-12 pt-24 pb-24">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh Toán</h1>

        {/* Layout: 1 Column + Sidebar Below */}
        <div className="grid grid-cols-1 gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* 📍 Địa Chỉ Giao Hàng */}
            <AddressSelector 
              selectedAddressId={selectedAddressId} 
              onSelectedAddressChange={setSelectedAddressId} 
            />

            {/* 🧾 Danh Sách Sản Phẩm */}
            <OrderSummary items={items} selectedItemIds={selectedItemIds} />

            {/* 💳 Phương Thức Thanh Toán */}
            <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />
          </div>

          {/* Price Summary - Below Main Content */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

              {/* Price Breakdown */}
              <div className="p-6 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 text-base">Tổng tiền hàng:</span>
                  <span className="font-semibold text-gray-900 text-base">
                    {(totalPrice).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Shipping Fee */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 text-base">Tổng tiền phí vận chuyển:</span>
                  <span className="font-semibold text-gray-900 text-base">0đ</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900 text-lg">Tổng thanh toán:</span>
                  <span className="text-3xl font-bold text-red-600">
                    {(totalPrice).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>


              {/* Buttons */}
              <div className="px-6 py-4 border-t border-gray-100">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || selectedItems.length === 0}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Đang xử lý...
                    </>
                  ) : (
                    `Đặt hàng`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <Toaster />
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
