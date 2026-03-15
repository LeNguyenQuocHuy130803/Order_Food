"use client";

import { useEffect, useState } from "react";
import { DrinkService } from "@/service/DrinkService";
import type { Drink } from "@/types/drink";

interface UseSearchResult {
  results: Drink[];
  loading: boolean;
  error: string | null;
}

/**
 * ============================================================================
 * Custom Hook: useSearch
 * ============================================================================
 * Mục đích: Quản lý state tìm kiếm sản phẩm
 *
 * @param name - Từ khóa tìm trong tên sản phẩm
 * @param description - Từ khóa tìm trong mô tả
 * @param category - Lọc theo loại sản phẩm (COFFEE, TEA, JUICE, MILK_TEA)
 * @param region - Lọc theo khu vực (HA_NOI, HO_CHI_MINH, ...)
 *
 * @returns { results, loading, error }
 *   - results: Mảng sản phẩm tìm được
 *   - loading: Đang tải dữ liệu?
 *   - error: Thông báo lỗi nếu có
 *
 * Ví dụ:
 * const { results, loading, error } = useSearch("cà phê", undefined, "COFFEE", "HA_NOI");
 */
export function useSearch(
  name?: string,
  description?: string,
  category?: string,
  region?: string
): UseSearchResult {
  const [results, setResults] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Nếu tất cả params bị undefined → không fetch
    if (!name && !description && !category && !region) {
      setResults([]);
      setError(null);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi API search từ DrinkService
        const data = await DrinkService.searchDrinks(
          name || undefined,
          description || undefined,
          category || undefined,
          region || undefined
        );

        setResults(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.";

        setError(errorMessage);
        console.error("useSearch error:", err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [name, description, category, region]);

  return {
    results,
    loading,
    error,
  };
}
