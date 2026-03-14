import { API_BASE_URL, DRINK_ENDPOINTS } from "@/lib/api";
import type { Drink, PaginatedDrinkResponse } from "@/types/drink";

/**
 * DrinkService - Tách logic API khỏi UI
 * Tất cả các request tới backend được định nghĩa ở đây
 */

export const DrinkService = {
  /**
   * Lấy danh sách sản phẩm có phân trang
   * @param page - Trang hiện tại (1-based, backend yêu cầu)
   * @param pageSize - Số item trên 1 trang (mặc định 10)
   * @returns PaginatedDrinkResponse từ backend
   */
  async getAllDrinksPaginated(
    page: number = 1,
    pageSize: number = 9
  ): Promise<PaginatedDrinkResponse> {
    try {
      const url = new URL(
        `${API_BASE_URL}${DRINK_ENDPOINTS.GET_ALL_PAGINATED}`
      );
      url.searchParams.append("page", page.toString());
      url.searchParams.append("size", pageSize.toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch drinks: ${response.status} ${response.statusText}`
        );
      }

      const data: PaginatedDrinkResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error in DrinkService.getAllDrinksPaginated:", error);
      throw error;
    }
  },

  /**
   * Lấy sản phẩm theo ID
   * @param id - ID của sản phẩm
   * @returns Drink object
   */
  async getDrinkById(id: number): Promise<Drink> {
    try {
      const url = `${API_BASE_URL}${DRINK_ENDPOINTS.GET_BY_ID}/${id}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch drink: ${response.status} ${response.statusText}`
        );
      }

      const data: Drink = await response.json();
      return data;
    } catch (error) {
      console.error("Error in DrinkService.getDrinkById:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm nâng cao sản phẩm
   * @param name - Tìm theo tên
   * @param description - Tìm theo description
   * @param category - Lọc theo category
   * @param region - Lọc theo khu vực
   * @returns Danh sách Drink matching criteria
   */
  async searchDrinks(
    name?: string,
    description?: string,
    category?: string,
    region?: string
  ): Promise<Drink[]> {
    try {
      const url = new URL(`${API_BASE_URL}${DRINK_ENDPOINTS.SEARCH}`);

      if (name) url.searchParams.append("name", name);
      if (description) url.searchParams.append("description", description);
      if (category) url.searchParams.append("category", category);
      if (region) url.searchParams.append("region", region);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to search drinks: ${response.status} ${response.statusText}`
        );
      }

      const data: Drink[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error in DrinkService.searchDrinks:", error);
      throw error;
    }
  },

  /**
   * Lọc sản phẩm theo nhiều tiêu chí
   * @param categories - Danh sách categories
   * @param featured - Chỉ lấy featured
   * @param unit - Lọc theo unit
   * @param minPrice - Giá tối thiểu
   * @param maxPrice - Giá tối đa
   * @param region - Khu vực
   * @returns Danh sách Drink matching filters
   */
  async filterDrinks(
    categories?: string[],
    featured?: boolean,
    unit?: string,
    minPrice?: number,
    maxPrice?: number,
    region?: string
  ): Promise<Drink[]> {
    try {
      const url = new URL(`${API_BASE_URL}${DRINK_ENDPOINTS.FILTER}`);

      if (categories && categories.length > 0) {
        categories.forEach((cat) =>
          url.searchParams.append("categories", cat)
        );
      }
      if (featured !== undefined) {
        url.searchParams.append("featured", featured.toString());
      }
      if (unit) url.searchParams.append("unit", unit);
      if (minPrice !== undefined) url.searchParams.append("minPrice", minPrice.toString());
      if (maxPrice !== undefined) url.searchParams.append("maxPrice", maxPrice.toString());
      if (region) url.searchParams.append("region", region);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to filter drinks: ${response.status} ${response.statusText}`
        );
      }

      const data: Drink[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error in DrinkService.filterDrinks:", error);
      throw error;
    }
  },
};
