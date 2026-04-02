'use client';

import ProductCard from '@/app/components/product-card';
import { ProductCardSkeleton } from '@/app/components/product-card-skeleton';
import type { Drink } from '@/types/drink';

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  results: Drink[];
  resultCount?: string; // Ví dụ: "Tìm thấy 5 kết quả"
  emptyMessage?: string;
  showPagination?: boolean; // Nếu có pagination thì parent truyền vào
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  currentPage?: number;
  totalPages?: number;
  productType?: 'drink' | 'food' | 'fresh'; // Để biết redirect tới loại nào
}

export function ResultsDisplay({
  loading,
  error,
  results,
  resultCount,
  emptyMessage = 'Không tìm thấy kết quả',
  showPagination = false,
  onPreviousPage,
  onNextPage,
  currentPage = 1,
  productType = 'drink',
  totalPages = 1,
}: ResultsDisplayProps) {
  // ════════════════════════════════════════════════════════════════════════
  // LOADING STATE - SKELETON CARDS
  // ════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <>
        {resultCount && (
          <div className="mb-6">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show 9 skeleton cards */}
          {Array.from({ length: 9 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // ERROR STATE
  // ════════════════════════════════════════════════════════════════════════
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-bold text-lg mb-2">❌ Lỗi</p>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // NO RESULTS STATE
  // ════════════════════════════════════════════════════════════════════════
  if (results.length === 0) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
        <p className="text-yellow-700 font-bold text-lg mb-2">😕 {emptyMessage}</p>
        <p className="text-yellow-600">
          Vui lòng thử lại với tiêu chí khác
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RESULTS GRID
  // ════════════════════════════════════════════════════════════════════════
  return (
    <>
      {resultCount && (
        <div className="mb-6">
          <p className="text-gray-600 font-semibold">{resultCount}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} type={productType} />
        ))}
      </div>

      {/* PAGINATION */}
      {showPagination && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={onPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            ← Trước
          </button>

          <span className="font-semibold">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            Sau →
          </button>
        </div>
      )}
    </>
  );
}
