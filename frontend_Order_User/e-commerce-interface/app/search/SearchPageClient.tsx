'use client';

import { useSearchParams, useRouter } from "next/navigation";

import { Footer } from "@/app/components/layout/footer";
import { Header } from "@/app/components/layout/header";
import { ResultsDisplay } from "@/app/components/results-display";

/**
 * ============================================================================
 * SEARCH PAGE (/search)
 * ============================================================================
 * 
 * Mục đích: Hiển thị kết quả tìm kiếm sản phẩm
 * 
 * Note: useSearch hook has been deprecated.
 * Currently shows search UI with no results.
 * Can be re-implemented with expanded search service if needed.
 * 
 * Ví dụ URL:
 * - /search?name=coffee
 * - /search?name=coffee&category=COFFEE&region=HA_NOI
 */

export default function SearchPageClient() {
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
        <ResultsDisplay
          loading={false}
          error={null}
          results={[]}
          productType="drink"
          emptyMessage="Tính năng tìm kiếm toàn cục đã bị vô hiệu hóa"
        />
      </div>

      <Footer />
    </main>
  );
}
