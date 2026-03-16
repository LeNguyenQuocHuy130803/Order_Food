"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Leaf } from "lucide-react";

import { FilterSidebar } from "@/app/components/filter_sidebar";
import { Footer } from "@/app/components/layout/footer";
import { ProductHeader } from "@/app/components/layout/product-header";
import { HeroBanner } from "@/app/components/hero-banner";
import { ResultsDisplay } from "@/app/components/results-display";

import { useFresh } from "@/hooks/useFresh";

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

const FRESH_CATEGORIES = [
  { name: 'VEGETABLE', displayName: 'VEGETABLE' },
  { name: 'FRUIT', displayName: 'FRUIT' },
  { name: 'MEAT', displayName: 'MEAT' },
  { name: 'SEAFOOD', displayName: 'SEAFOOD' },
  { name: 'DAIRY', displayName: 'DAIRY' },
  { name: 'HERB', displayName: 'HERB' },
];

export default function FreshPage() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const filterRef = useRef<HTMLDivElement>(null);

  const filters: FilterParams = useMemo(() => 
    parseUrlParamsToFilters(searchParams), 
    [searchParams]
  );

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);

  const pageSize = DEFAULT_PAGE_SIZE;

  const { fresh, loading, error, totalPages } = useFresh(
    filters,
    currentPage,
    pageSize
  );

  const handleFilterChange = (newFilters: FilterParams) => {

    const params = filtersToUrlParams(newFilters);

    const query = params.toString();

    router.push(`/fresh${query ? `?${query}` : ""}`);
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
        icon={Leaf}
        badge="Giao lanh 30 phut"
        headline="San pham tuoi sach moi ngay"
        description="Nhung san pham tuoi sach, dinh duong cao duoc chon loc ky luong. Bat qua thuc pham tuoi tot nhat."
        imageSrc="/image/fresh/bo-rau-cai.jpg"
        imageAlt="Fresh produce"
      />

      {/* Filter & Results Section */}
      <div ref={filterRef}>
        <FilterSidebar
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          categories={FRESH_CATEGORIES}
        />

        <div className="max-w-7xl mx-auto px-4 py-12">

        <ResultsDisplay
          loading={loading}
          error={error}
          results={fresh}
          productType="fresh"
          resultCount={Object.keys(filters).length === 0 ? `Hiển thị ${fresh.length} sản phẩm` : undefined}
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
