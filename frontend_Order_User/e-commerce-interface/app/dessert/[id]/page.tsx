'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Loader } from 'lucide-react'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'
import { dessertService } from '@/service/DessertService'
import type { Dessert } from '@/types/dessert'

export default function DessertDetailPage({ params }: { params: { id: string } }) {
  const [dessert, setDessert] = useState<Dessert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const fetchDessert = async () => {
      try {
        setLoading(true)
        const data = await dessertService.getDessertById(parseInt(params.id))
        setDessert(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load dessert')
      } finally {
        setLoading(false)
      }
    }

    fetchDessert()
  }, [params.id])

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center mt-20">
          <Loader className="w-8 h-8 animate-spin text-[#ff5528]" />
        </div>
        <Footer />
      </>
    )
  }

  if (error || !dessert) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center mt-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Dessert not found'}</p>
            <Link href="/dessert" className="text-[#ff5528] hover:underline">
              Back to Desserts
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <Link href="/" className="text-[#ff5528] hover:text-[#0d0d0d]">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/dessert" className="text-[#ff5528] hover:text-[#0d0d0d]">
              Desserts
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#0d0d0d] font-semibold">{dessert.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg p-8">
            {/* Image */}
            <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={dessert.imageUrl}
                alt={dessert.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div>
              {/* Title & Rating */}
              <h1 className="text-3xl font-bold text-[#0d0d0d] mb-2">{dessert.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(128 reviews)</span>
              </div>

              {/* Category & Region */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[#ff5528]/10 text-[#ff5528] rounded-full text-sm font-semibold">
                  {dessert.category}
                </span>
                {dessert.region && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {dessert.region}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">{dessert.description}</p>

              {/* Price */}
              <div className="mb-6 border-t border-b border-gray-200 py-4">
                <p className="text-gray-600 text-sm mb-2">Price per {dessert.unit}</p>
                <p className="text-3xl font-bold text-[#ff5528]">${dessert.price}</p>
                <p className="text-xs text-gray-500 mt-2">In Stock: {dessert.quantity}</p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-semibold">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-[#ff5528] text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`px-6 py-3 rounded-lg font-semibold border-2 transition-colors ${
                    isFavorited
                      ? 'bg-red-50 border-red-600 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:border-red-600'
                  }`}
                >
                  <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 space-y-4 border-t border-gray-200 pt-8">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-semibold">DESSERT-{dessert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold">{dessert.category}</span>
                </div>
                {dessert.region && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-semibold">{dessert.region}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
