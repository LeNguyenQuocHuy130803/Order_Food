"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Coffee } from "lucide-react";

import { FilterSidebar } from "@/app/components/filter_sidebar";
import { Footer } from "@/app/components/layout/footer";
import { ProductHeader } from "@/app/components/layout/product-header";
import { HeroBanner } from "@/app/components/hero-banner";
import { ResultsDisplay } from "@/app/components/results-display";

import { useDrinks } from "@/hooks/useDrinks";

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

const DRINK_CATEGORIES = [
  { name: 'COFFEE', displayName: 'COFFEE' },
  { name: 'JUICE', displayName: 'JUICE' },
  { name: 'MILK_TEA', displayName: 'MILK_TEA' },
  { name: 'TEA', displayName: 'TEA' },
];

export default function FoodPage() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const filterRef = useRef<HTMLDivElement>(null);

  // dùng để lưu filter đã được parse từ URL, sẽ được truyền vào useDrinks để fetch dữ liệu
  const filters: FilterParams = useMemo(() => 
    parseUrlParamsToFilters(searchParams), 
    [searchParams]
  );

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);

  const pageSize = DEFAULT_PAGE_SIZE;

  const { drinks, loading, error, totalPages } = useDrinks(
    filters,
    currentPage,
    pageSize
  );

  const handleFilterChange = (newFilters: FilterParams) => {

    const params = filtersToUrlParams(newFilters);

    const query = params.toString();

    router.push(`/drink${query ? `?${query}` : ""}`);
  };

  // Smooth scroll to filter+products section when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0 && filterRef.current) {
      setTimeout(() => {
        smoothScrollTo(filterRef.current!, 1500); // 1.5 seconds slow scroll
      }, 100);
    }
  }, [filters]);

  return (
    <main className="bg-background min-h-screen">

      <ProductHeader />

      {/* Hero Banner */}
      <HeroBanner
        icon={Coffee}
        badge="Giao lanh 30 phut"
        headline="Do uong tuoi mat moi ngay"
        description="Tu ca phe truyen thong den tra sua hien dai, nuoc ep tuoi va sinh to. Tat ca duoc pha che tuoi va giao nhanh den ban."
        imageSrc="/image/drink1.jpg"
        imageAlt="Delicious drinks"
      />

      {/* Filter & Results Section */}
      <div ref={filterRef}>
        <FilterSidebar
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          categories={DRINK_CATEGORIES}
        />

        <div className="max-w-7xl mx-auto px-4 py-12">

        <ResultsDisplay
          loading={loading}
          error={error}
          results={drinks}
          productType="drink"
          resultCount={Object.keys(filters).length === 0 ? `Hiển thị ${drinks.length} sản phẩm` : undefined}
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