import { API_BASE_URL, FRESH_ENDPOINTS } from "@/lib/api";
import type { Fresh, PaginatedFreshResponse } from "@/types/fresh";

/**
 * FreshService - Tách logic API khỏi UI
 * Tất cả các request tới backend được định nghĩa ở đây
 */

export const FreshService = {
  /**
   * Lấy danh sách sản phẩm có phân trang
   * @param page - Trang hiện tại (1-based, backend yêu cầu)
   * @param pageSize - Số item trên 1 trang (mặc định 10)
   * @returns PaginatedFreshResponse từ backend
   */
  async getAllFreshPaginated(
    page: number = 1,
    pageSize: number = 9
  ): Promise<PaginatedFreshResponse> {
    try {
      const url = new URL(
        `${API_BASE_URL}${FRESH_ENDPOINTS.GET_ALL_PAGINATED}`
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
          `Failed to fetch fresh: ${response.status} ${response.statusText}`
        );
      }

      const data: PaginatedFreshResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error in FreshService.getAllFreshPaginated:", error);
      throw error;
    }
  },

  /**
   * Lấy sản phẩm theo ID
   * @param id - ID của sản phẩm
   * @returns Fresh object
   */
  async getFreshById(id: number): Promise<Fresh> {
    try {
      const url = `${API_BASE_URL}${FRESH_ENDPOINTS.GET_BY_ID}/${id}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch fresh: ${response.status} ${response.statusText}`
        );
      }

      const data: Fresh = await response.json();
      return data;
    } catch (error) {
      console.error("Error in FreshService.getFreshById:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm nâng cao sản phẩm
   * @param name - Tìm theo tên
   * @param description - Tìm theo description
   * @param category - Lọc theo category
   * @param region - Lọc theo khu vực
   * @returns Danh sách Fresh matching criteria
   */
  async searchFresh(
    name?: string,
    description?: string,
    category?: string,
    region?: string
  ): Promise<Fresh[]> {
    try {
      const url = new URL(`${API_BASE_URL}${FRESH_ENDPOINTS.SEARCH}`);

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
          `Failed to search fresh: ${response.status} ${response.statusText}`
        );
      }

      const data: Fresh[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error in FreshService.searchFresh:", error);
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
   * @returns Danh sách Fresh matching filters
   */
  async filterFresh(
    categories?: string[],
    featured?: boolean,
    unit?: string,
    minPrice?: number,
    maxPrice?: number,
    region?: string
  ): Promise<Fresh[]> {
    try {
      const url = new URL(`${API_BASE_URL}${FRESH_ENDPOINTS.FILTER}`);

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
          `Failed to filter fresh: ${response.status} ${response.statusText}`
        );
      }

      const data: Fresh[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error in FreshService.filterFresh:", error);
      throw error;
    }
  },
};
