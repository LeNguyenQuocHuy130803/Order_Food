"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { DrinkCardProps } from "@/types/drink"

export default function DrinkCard(props: DrinkCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const searchParams = useSearchParams()
  const { id, name, imageUrl, price, featured, description } = props

  // Preserve query params when navigating to detail page
  const detailHref = `/drink/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

  return (
    <Link href={detailHref}>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
      {/* Image Container */}
      <div className="relative w-full h-64 overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />

        {/* Badge FEATURED */}
        {featured && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2.5 py-1.5 rounded-full text-xs font-bold">
            Nổi bật
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsFavorited(!isFavorited)
          }}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Heart
            size={20}
            className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col gap-3">
        {/* Name with Order Button */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground text-base line-clamp-2 flex-1">
            {name}
          </h3>
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap">
            Order
          </button>
        </div>

      </div>
    </div>
    </Link>
  )
}
