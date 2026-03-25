"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

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

export default function ProductCard({ product, type }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const { id, name, imageUrl, featured, price } = product

  const detailHref = `/${type}/${id}`

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
              Nổi bật
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

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
          >
            Order
          </button>
        </div>

      </div>
    </Link>
  )
}
