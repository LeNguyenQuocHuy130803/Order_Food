"use client";

import { useEffect, useState } from "react";
import { FoodService } from "@/service/FoodService";
import type { Food } from "@/types/food";
import type { FilterParams } from "@/types/drink";

interface UseFoodsResult {
  foods: Food[];
  loading: boolean;
  error: string | null;
  totalPages: number;
}

export function useFoods(
  filters: FilterParams,
  page: number,
  pageSize: number
): UseFoodsResult {

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {

    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError(null);

        if (Object.keys(filters).length > 0) {

          const filteredData = await FoodService.filterFoods(
            filters.categories,
            filters.featured,
            filters.unit,
            filters.minPrice,
            filters.maxPrice,
            filters.region
          );

          setFoods(filteredData);
          setTotalPages(1);

        } else {

          const response = await FoodService.getAllFoodsPaginated(
            page,
            pageSize
          );

          setFoods(response.data);
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

    fetchFoods();

  }, [filters, page, pageSize]);

  return {
    foods,
    loading,
    error,
    totalPages
  };
}
