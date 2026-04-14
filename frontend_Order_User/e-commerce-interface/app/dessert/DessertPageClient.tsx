'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Cake } from 'lucide-react'
import { FilterSidebar } from '@/app/components/filter_sidebar'
import { ResultsDisplay } from '@/app/components/results-display'
import { ProductHeader } from '@/app/components/layout/product-header'
import { Footer } from '@/app/components/layout/footer'
import { HeroBanner } from '@/app/components/hero-banner'
import { useDessertQuery } from '@/hooks/useDessertQuery'
import type { FilterParams } from '@/types/drink'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 9

const DESSERT_CATEGORIES = [
  { name: 'CAKE', displayName: 'Cake' },
  { name: 'COOKIE', displayName: 'Cookie' },
  { name: 'CHEESECAKE', displayName: 'Cheesecake' },
  { name: 'DONUT', displayName: 'Donut' },
  { name: 'BROWNIE', displayName: 'Brownie' },
  { name: 'MOUSSE', displayName: 'Mousse' },
  { name: 'TART', displayName: 'Tart' },
  { name: 'PUDDING', displayName: 'Pudding' },
]

export function DessertPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterRef = useRef<HTMLDivElement>(null)

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)

  // Decode filters from URL
  const filters = useMemo<FilterParams | undefined>(() => {
    const categories = searchParams.getAll('categories')
    const featured = searchParams.get('featured')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const unit = searchParams.get('unit')
    const region = searchParams.get('region')

    // If no filters selected, return undefined
    if (!categories.length && !featured && !minPrice && !maxPrice && !unit && !region) {
      return undefined
    }

    return {
      categories: categories.length > 0 ? categories : undefined,
      featured: featured ? featured === 'true' : undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      unit: unit || undefined,
      region: region || undefined,
    }
  }, [searchParams])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE)
  }, [filters])

  // Fetch desserts
  const { desserts, loading, error, totalPages } = useDessertQuery(filters, currentPage, pageSize)

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterParams) => {
    const params = new URLSearchParams()

    if (newFilters.categories?.length) {
      newFilters.categories.forEach(cat => params.append('categories', cat))
    }
    if (newFilters.featured !== undefined) {
      params.append('featured', String(newFilters.featured))
    }
    if (newFilters.minPrice !== undefined) {
      params.append('minPrice', String(newFilters.minPrice))
    }
    if (newFilters.maxPrice !== undefined) {
      params.append('maxPrice', String(newFilters.maxPrice))
    }
    if (newFilters.unit) {
      params.append('unit', newFilters.unit)
    }
    if (newFilters.region) {
      params.append('region', newFilters.region)
    }

    router.push(`/dessert?${params.toString()}`)
  }

  // Smooth scroll to filter+products section when filters change
  useEffect(() => {
    if (Object.keys(filters || {}).length > 0 && filterRef.current) {
      setTimeout(() => {
        filterRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    }
  }, [filters])

  return (
    <main className="bg-background min-h-screen">
      <ProductHeader />

      {/* Hero Banner */}
      <HeroBanner
        icon={Cake}
        badge="Fresh & Sweet"
        headline="Delicious Desserts"
        description="Enjoy our delicious dessert collection. From cakes to pastries, all freshly made and delivered quickly to you."
        imageSrc="/image/dessert/banhbrownie1.jpg"
        imageAlt="Delicious desserts"
      />

      {/* Filter & Results Section */}
      <div ref={filterRef}>
        <FilterSidebar
          onFilterChange={handleFiltersChange}
          initialFilters={filters}
          categories={DESSERT_CATEGORIES}
        />

        <div className="max-w-7xl mx-auto px-4 py-12">
          <ResultsDisplay
            loading={loading}
            error={error}
            results={desserts}
            productType="food"
            resultCount={Object.keys(filters || {}).length === 0 ? `Showing ${desserts.length} products` : undefined}
            showPagination={Object.keys(filters || {}).length === 0}
            onPreviousPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      <Footer />

    </main>
  )
}

