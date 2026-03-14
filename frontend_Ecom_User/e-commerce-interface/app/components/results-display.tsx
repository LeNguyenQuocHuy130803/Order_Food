'use client';

import DrinkCard from '@/app/components/drink_card';
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
  totalPages = 1,
}: ResultsDisplayProps) {
  // ════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin inline-block mb-4">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
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
        {results.map((drink) => (
          <DrinkCard key={drink.id} {...drink} />
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
