"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { FilterSidebar } from "@/app/components/filter_sidebar";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ResultsDisplay } from "@/app/components/results-display";

import { useFoods } from "@/hooks/useFoods";

import type { FilterParams } from "@/types/drink";

import {
  parseUrlParamsToFilters,
  filtersToUrlParams
} from "@/utils/filter";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 9;

export default function FoodPage() {

  const searchParams = useSearchParams();
  const router = useRouter();

  const filters: FilterParams = useMemo(() => 
    parseUrlParamsToFilters(searchParams), 
    [searchParams]
  );

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const pageSize = DEFAULT_PAGE_SIZE;

  const { foods, loading, error, totalPages } = useFoods(
    filters,
    currentPage,
    pageSize
  );

  const handleFilterChange = (newFilters: FilterParams) => {

    const params = filtersToUrlParams(newFilters);

    const query = params.toString();

    router.push(`/food${query ? `?${query}` : ""}`);
  };

  return (
    <main className="bg-background min-h-screen">

      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12 pt-22">

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🍔</span>
            <h1 className="text-4xl font-bold">Food</h1>
          </div>
          <p className="text-gray-600 text-lg">Tận hưởng những món ăn ngon tuyệt với chất lượng hàng đầu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <FilterSidebar
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            onIsOpenChange={setIsSidebarOpen}
          />

          <div className={isSidebarOpen ? "lg:col-span-3" : "lg:col-span-4"}>

            <ResultsDisplay
              loading={loading}
              error={error}
              results={foods}
              productType="food"
              resultCount={Object.keys(filters).length === 0 ? `Hiển thị ${foods.length} sản phẩm` : undefined}
              showPagination={Object.keys(filters).length === 0}
              onPreviousPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              onNextPage={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              currentPage={currentPage}
              totalPages={totalPages}
            />

          </div>

        </div>

      </div>

      <Footer />

    </main>
  );
}
