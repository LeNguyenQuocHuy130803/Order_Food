"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { CartService } from "@/service/CartService"

interface Product {
  id: number
  name: string
  imageUrl: string
  price: number
  featured: boolean
}

interface ProductCardProps {
  product: Product
  type: 'drink' | 'food' | 'fresh'
}
// file này dùng để hiển thị giao diện card sản phẩm chung cho cả 3 loại: drink, food, fresh
export default function ProductCard({ product, type }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { id, name, imageUrl, featured, price } = product

  const detailHref = `/${type}/${id}`

  // 🛒 Xử lý thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Convert type thành productType (food → FOOD, drink → DRINK, etc)
      const productType = type.toUpperCase()
      const quantity = 1

      console.log(`🛒 [ProductCard] Adding to cart:`, { productType, productId: id, quantity })

      // ✅ Gọi CartService để thêm vào giỏ hàng (dùng accessToken từ cookies)
      const cartData = await CartService.addProductToCart(productType, id, quantity)

      console.log(`✅ [ProductCard] Added to cart success:`, cartData)
      setSuccess(true)

      // Ẩn success message sau 2 giây
      setTimeout(() => setSuccess(false), 2000)
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add to cart'
      console.error(`❌ [ProductCard] Error:`, errorMsg)
      setError(errorMsg)

      // Ẩn error message sau 3 giây
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={detailHref}>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full">

        <div className="relative w-full h-64 overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {featured && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1.5 rounded-full text-xs font-bold">
              Best Seller
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsFavorited(!isFavorited)
            }}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg"
          >
            <Heart
              size={20}
              className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start gap-2 mb-3">
            <h3 className="font-bold text-base line-clamp-2">{name}</h3>
            {price && (
              <p className="text-[#ff5528] font-bold text-lg whitespace-nowrap">
                {typeof price === 'number' ? `${price.toLocaleString('vi-VN')}₫` : price}
              </p>
            )}
          </div>

          {/* Message: Success - Modal Style */}
          {success && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white rounded-lg p-8 max-w-sm text-center shadow-lg">
                {/* Checkmark Icon */}
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Message */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Sản phẩm{" "}
                  <span className="text-red-500 font-extrabold">
                    {name}
                  </span>{" "}
                  đã được thêm vào Giỏ hàng
                </h3>
              </div>
            </div>
          )}

          {/* Message: Error */}
          {error && (
            <div className="mb-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              ✗ {error}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {loading ? '⏳ Adding...' : 'Order'}
          </button>
        </div>

      </div>
    </Link>
  )
}
