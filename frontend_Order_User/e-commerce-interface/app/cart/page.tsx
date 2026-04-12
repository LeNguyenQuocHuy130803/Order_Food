"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2, ArrowLeft, Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { useCartQuery } from "@/hooks/useCartQuery"
import { useDebounce } from "@/hooks/useDebounce"
import { CartService } from "@/service/CartService"
import { ProductHeader } from "@/app/components/layout/product-header"
import { Footer } from "@/app/components/layout/footer"
import { CartItem } from "@/types/cart"

export default function CartPage() {
  const router = useRouter()
  const { cart, items, itemCount, totalPrice, loading, error, refetch } = useCartQuery()
  const [deleting, setDeleting] = useState<number | null>(null)
  
  // 🔄 Track local quantity changes for optimistic UI update
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({})
  
  // ❌ Track errors for each item (especially "Not enough stock")
  const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({})
  
  // ⏳ Track which items are updating
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())
  
  // 🔒 Track available quantity for each item (để disable button +)
  const [availableQuantities, setAvailableQuantities] = useState<Record<number, number>>({})

  // 🔄 Initialize local quantities when items load
  useEffect(() => {
    const newQuantities: Record<number, number> = {}
    items.forEach(item => {
      newQuantities[item.id] = item.quantity
    })
    setLocalQuantities(newQuantities)
    // ⚠️ KHÔNG khởi tạo availableQuantities từ item.quantity
    // Chỉ set khi API error trả về available quantity
    setAvailableQuantities({})
  }, [items])

  // 📡 Handle update quantity with debounce
  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    try {
      console.log(`🛒 [CartPage] Updating quantity:`, { cartItemId, newQuantity })

      setUpdatingItems(prev => new Set(prev).add(cartItemId))
      setQuantityErrors(prev => ({ ...prev, [cartItemId]: '' }))

      // ✅ Call API to update quantity
      await CartService.updateCartItemQuantity(cartItemId, newQuantity)

      console.log(`✅ [CartPage] Update successful, refetching cart...`)
      
      // 🔄 Refetch cart to get updated data
      await refetch()
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update quantity'
      console.log(`⚠️ [CartPage] Update failed:`, errorMsg) // ⚠️ Dùng log, không error

      // 🔍 Parse error để extract available quantity
      // Format: "Not enough stock. Available: 20"
      const availableMatch = errorMsg.match(/Available:\s*(\d+)/)
      const availableQty = availableMatch ? parseInt(availableMatch[1]) : null

      if (availableQty !== null) {
        // ✅ Có available quantity → reset về đó
        setQuantityErrors(prev => ({
          ...prev,
          [cartItemId]: `Not enough stock. Available: ${availableQty}`
        }))
        
        // 🔄 Reset quantity về available
        setLocalQuantities(prev => ({ ...prev, [cartItemId]: availableQty }))
        
        // 📊 Update available quantity
        setAvailableQuantities(prev => ({ ...prev, [cartItemId]: availableQty }))
      } else {
        // Generic error
        setQuantityErrors(prev => ({ ...prev, [cartItemId]: errorMsg }))
        
        // 🔄 Revert quantity to original value
        const originalItem = items.find(item => item.id === cartItemId)
        if (originalItem) {
          setLocalQuantities(prev => ({ ...prev, [cartItemId]: originalItem.quantity }))
        }
      }

      // ⏳ Auto-hide error after 4 seconds
      setTimeout(() => {
        setQuantityErrors(prev => ({ ...prev, [cartItemId]: '' }))
      }, 4000)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(cartItemId)
        return newSet
      })
    }
  }

  // ✅ Debounced update function (delay 1.5 seconds)
  const debouncedUpdateQuantity = useDebounce(handleUpdateQuantity, 1500)

  // 👆 Handle minus button click
  const handleDecreaseQuantity = (cartItemId: number) => {
    setLocalQuantities(prev => {
      const currentQty = prev[cartItemId] || 0
      if (currentQty > 1) {
        const newQty = currentQty - 1
        debouncedUpdateQuantity(cartItemId, newQty)
        return { ...prev, [cartItemId]: newQty }
      }
      return prev
    })
  }

  // 👆 Handle plus button click
  const handleIncreaseQuantity = (cartItemId: number) => {
    setLocalQuantities(prev => {
      const currentQty = prev[cartItemId] || 0
      const newQty = currentQty + 1
      debouncedUpdateQuantity(cartItemId, newQty)
      return { ...prev, [cartItemId]: newQty }
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
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

  if (error || !cart) {
    return (
      <main className="min-h-screen bg-background">
        <ProductHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700 font-semibold text-lg mb-4">
              ❌ {error || "Failed to load cart"}
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <ProductHeader />

      <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors mb-8 font-semibold"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {itemCount === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <Link
              href="/food"
              className="inline-block px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="pb-32">
            {/* Cart Items - Full Width */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 items-center p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  {/* Checkbox - Col 1 */}
                  <input type="checkbox" className="col-span-1 w-5 h-5 rounded" />
                  
                  {/* Product Image + Name - Col 4 */}
                  <div className="col-span-4 flex items-center gap-3">
                    {/* Image */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.imageUrl || "/image/avatarNull/avatarNull.jpg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Name */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">{item.productName}</h3>
                    </div>
                  </div>

                  {/* Price - Col 2 */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm text-gray-600">
                      ${(item.priceAtTime / 1000).toFixed(1)}
                    </p>
                  </div>

                  {/* Quantity Control - Col 2 */}
                  <div className="col-span-2 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDecreaseQuantity(item.id)}
                        disabled={updatingItems.has(item.id) || localQuantities[item.id] === 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={localQuantities[item.id] || item.quantity}
                        readOnly
                        className="w-20 py-2 text-center text-sm border border-gray-300 rounded-md outline-none bg-white font-semibold"
                      />
                      <button 
                        onClick={() => handleIncreaseQuantity(item.id)}
                        disabled={updatingItems.has(item.id) || (localQuantities[item.id] || item.quantity) >= (availableQuantities[item.id] || 999999)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    {/* 🔄 Show updating indicator */}
                    {updatingItems.has(item.id) && (
                      <p className="text-xs text-blue-500 font-semibold">⏳ Updating...</p>
                    )}
                    
                    {/* ❌ Show error message for this item */}
                    {quantityErrors[item.id] && (
                      <p className="text-xs text-red-600 font-semibold text-center max-w-xs">
                        ✗ {quantityErrors[item.id]}
                      </p>
                    )}
                  </div>

                  {/* Total Price - Col 2 */}
                  <div className="col-span-2 text-right">
                    <p className="text-base font-bold text-red-500">
                      ${(((item.priceAtTime * (localQuantities[item.id] || item.quantity)) || 0) / 1000).toFixed(1)}
                    </p>
                  </div>

                  {/* Delete Button - Col 1 */}
                  <button
                    onClick={() => setDeleting(item.id)}
                    disabled={deleting === item.id}
                    className="col-span-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 flex justify-center"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${(totalPrice / 1000).toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="text-sm text-gray-500">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-red-500">
                  ${(totalPrice / 1000).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Checkout Section */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex gap-3">
            <Link
              href="/food"
              className="flex-1 text-center border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Mua Hàng
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
