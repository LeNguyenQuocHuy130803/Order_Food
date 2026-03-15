"use client";

import { useEffect, useState } from "react";
import { DrinkService } from "@/service/DrinkService";
import type { Drink, FilterParams } from "@/types/drink";

interface UseDrinksResult {
  drinks: Drink[];
  loading: boolean;
  error: string | null;
  totalPages: number;
}

export function useDrinks(
  filters: FilterParams,
  page: number,
  pageSize: number
): UseDrinksResult {

  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {

    const fetchDrinks = async () => {
      try {
        setLoading(true);
        setError(null);

        if (Object.keys(filters).length > 0) {

          const filteredData = await DrinkService.filterDrinks(
            filters.categories,
            filters.featured,
            filters.unit,
            filters.minPrice,
            filters.maxPrice,
            filters.region
          );

          setDrinks(filteredData);   // nếu call api thì dlieu trả về (filteredData) sẽ được lưu vào setDrinks 
          setTotalPages(1);  // vì dlieu trả vè ở backend ko làm phân trang nên nên nó để là 1 tức là tất cả sản phẩm sau khi filter sẽ được trả về 1 page duy nhất.

        } else {

          const response = await DrinkService.getAllDrinksPaginated(
            page,
            pageSize
          );

          setDrinks(response.data);
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

    fetchDrinks();

  }, [filters, page, pageSize]);

  return {
    drinks,
    loading,
    error,
    totalPages
  };
}