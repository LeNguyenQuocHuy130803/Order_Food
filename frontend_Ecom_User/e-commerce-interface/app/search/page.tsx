"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ResultsDisplay } from "@/app/components/results-display";

import { useSearch } from "@/hooks/useSearch";

/**
 * ============================================================================
 * SEARCH PAGE (/search)
 * ============================================================================
 * 
 * Mục đích: Hiển thị kết quả tìm kiếm sản phẩm
 * 
 * Quy trình:
 * 1. Lấy query params từ URL (?name=..., ?description=..., ?category=..., ?region=...)
 * 2. Gọi hook useSearch với params
 * 3. Hook gọi DrinkService.searchDrinks() để fetch dữ liệu
 * 4. Hiển thị kết quả (loading, error, hoặc danh sách sản phẩm)
 * 
 * Ví dụ URL:
 * - /search?name=coffee
 * - /search?name=coffee&category=COFFEE&region=HA_NOI
 */

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ════════════════════════════════════════════════════════════════════════
  // 1️⃣ LẤY QUERY PARAMS TỪ URL
  // ════════════════════════════════════════════════════════════════════════
  const name = searchParams.get("name") || "";
  const description = searchParams.get("description") || "";
  const category = searchParams.get("category") || "";
  const region = searchParams.get("region") || "";

  // ════════════════════════════════════════════════════════════════════════
  // 2️⃣ GỌI HOOK: useSearch (logic lấy dữ liệu từ API)
  // ════════════════════════════════════════════════════════════════════════
  const { results, loading, error } = useSearch(
    name || undefined,
    description || undefined,
    category || undefined,
    region || undefined
  );

  // ════════════════════════════════════════════════════════════════════════
  // RETURN (JSX)
  // ════════════════════════════════════════════════════════════════════════

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12 pt-22">
        {/* HEADER - SEARCH CRITERIA */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Kết quả tìm kiếm
          </h1>

          {/* DISPLAY SEARCH PARAMS */}
          <div className="flex flex-wrap gap-2 items-center">
            {name && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                🔍 Tên: <strong>{name}</strong>
              </span>
            )}
            {description && (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                📝 Mô tả: <strong>{description}</strong>
              </span>
            )}
            {category && (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                🏷️ Loại: <strong>{category}</strong>
              </span>
            )}
            {region && (
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                📍 Khu vực: <strong>{region}</strong>
              </span>
            )}

            {/* BACK BUTTON */}
            <button
              onClick={() => router.back()}
              className="ml-auto px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition-colors font-medium"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* RESULTS DISPLAY */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <ResultsDisplay
          loading={loading}
          error={error}
          results={results}
          resultCount={results.length > 0 ? `Tìm thấy ${results.length} kết quả` : undefined}
          emptyMessage="Không tìm thấy kết quả"
        />
      </div>

      <Footer />
    </main>
  );
}
