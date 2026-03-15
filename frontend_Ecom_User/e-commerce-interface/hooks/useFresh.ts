"use client";

import { useEffect, useState } from "react";
import { FreshService } from "@/service/FreshService";
import type { Fresh } from "@/types/fresh";
import type { FilterParams } from "@/types/drink";

interface UseFreshResult {
  fresh: Fresh[];
  loading: boolean;
  error: string | null;
  totalPages: number;
}

export function useFresh(
  filters: FilterParams,
  page: number,
  pageSize: number
): UseFreshResult {

  const [fresh, setFresh] = useState<Fresh[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {

    const fetchFresh = async () => {
      try {
        setLoading(true);
        setError(null);

        if (Object.keys(filters).length > 0) {

          const filteredData = await FreshService.filterFresh(
            filters.categories,
            filters.featured,
            filters.unit,
            filters.minPrice,
            filters.maxPrice,
            filters.region
          );

          setFresh(filteredData);
          setTotalPages(1);

        } else {

          const response = await FreshService.getAllFreshPaginated(
            page,
            pageSize
          );

          setFresh(response.data);
          setTotalPages(response.totalPages);

        }

      } catch (err) {

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi tải dữ liệu";

        setError(errorMessage);

      } finally {
        setLoading(false);
      }
    };

    fetchFresh();

  }, [filters, page, pageSize]);

  return {
    fresh,
    loading,
    error,
    totalPages
  };
}
