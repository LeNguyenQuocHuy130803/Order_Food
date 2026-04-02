'use client'

/**
 * Skeleton loader cho ProductCard
 * Hiển thị placeholder khi đang load dữ liệu
 */
export function ProductCardSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-md animate-pulse h-full">
      {/* Image skeleton */}
      <div className="relative w-full h-64 bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Heart button skeleton */}
        <div className="flex justify-end">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        </div>

        {/* Product name skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>

        {/* Price skeleton */}
        <div className="pt-2">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
        </div>

        {/* Button skeleton */}
        <div className="pt-4">
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>
      </div>
    </div>
  )
}
