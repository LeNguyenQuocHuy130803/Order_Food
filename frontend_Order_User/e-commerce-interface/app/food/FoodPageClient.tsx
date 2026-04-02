'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";

import { FilterSidebar } from "@/app/components/filter_sidebar";
import { Footer } from "@/app/components/layout/footer";
import { ProductHeader } from "@/app/components/layout/product-header";
import { HeroBanner } from "@/app/components/hero-banner";
import { ResultsDisplay } from "@/app/components/results-display";

// ✨ New: Use React Query hook instead of manual state management
import { useFoodsQuery } from "@/hooks/useFoodsQuery";

import type { FilterParams } from "@/types/drink";

import {
  parseUrlParamsToFilters,
  filtersToUrlParams
} from "@/utils/filter";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 9;

// Custom smooth scroll function with duration control
const smoothScrollTo = (element: HTMLElement, duration: number = 1500, offset: number = -100) => {
  const targetPosition = element.getBoundingClientRect().top + window.scrollY + offset;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  const animation = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth deceleration
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    window.scrollTo(0, startPosition + distance * easeProgress);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

const FOOD_CATEGORIES = [
  { name: 'RICE', displayName: 'RICE' },
  { name: 'NOODLE', displayName: 'NOODLE' },
  { name: 'BREAD', displayName: 'BREAD' },
  { name: 'MEAT', displayName: 'MEAT' },
  { name: 'SOUP', displayName: 'SOUP' },
  { name: 'SALAD', displayName: 'SALAD' },
  { name: 'PIZZA', displayName: 'PIZZA' },
  { name: 'BURGER', displayName: 'BURGER' },
];

export default function FoodPageClient() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const filterRef = useRef<HTMLDivElement>(null);

  const filters: FilterParams = useMemo(() => 
    parseUrlParamsToFilters(searchParams), 
    [searchParams]
  );

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);

  const pageSize = DEFAULT_PAGE_SIZE;

  // ✨ React Query tự handle caching & deduplication
  const { foods, loading, error, totalPages } = useFoodsQuery(
    filters,
    currentPage,
    pageSize
  );

  const handleFilterChange = (newFilters: FilterParams) => {

    const params = filtersToUrlParams(newFilters);

    const query = params.toString();

    router.push(`/food${query ? `?${query}` : ""}`);
  };

  // Smooth scroll to filter+products section when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0 && filterRef.current) {
      setTimeout(() => {
        smoothScrollTo(filterRef.current!, 1500);
      }, 100);
    }
  }, [filters]);

  return (
    <main className="bg-background min-h-screen">

      <ProductHeader />

      {/* Hero Banner */}
      <HeroBanner
        icon={UtensilsCrossed}
        badge="30-minute delivery"
        headline="Delicious Food Every Day"
        description="Enjoy delicious meals with top quality. All items are carefully selected."
        imageSrc="/image/food/pho-bo-ha-noi.jpg"
        imageAlt="Delicious food"
      />

      {/* Filter & Results Section */}
      <div ref={filterRef}>
        <FilterSidebar
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          categories={FOOD_CATEGORIES}
        />

        <div className="max-w-7xl mx-auto px-4 py-12">
          <ResultsDisplay
            loading={loading}
            error={error}
            results={foods}
            productType="food"
            resultCount={Object.keys(filters).length === 0 ? `Showing ${foods.length} products` : undefined}
            showPagination={Object.keys(filters).length === 0}
            onPreviousPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      <Footer />

    </main>
  );
}
