import type { Fresh, PaginatedFreshResponse } from "@/types/fresh";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * FreshService - Tách logic API khỏi UI
 * Dùng Fetch API + async/await (không cần auth token)
 * 🔒 API sản phẩm công khai - không cần authentication
 */

/**
 * Lấy danh sách sản phẩm có phân trang
 * @param page - Trang hiện tại (1-based)
 * @param pageSize - Số item trên 1 trang (mặc định 9)
 * @returns PaginatedFreshResponse từ backend
 */
export const getAllFreshPaginated = async (
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedFreshResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

    const res = await fetch(`${API_URL}/freshs/paging?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to fetch fresh products");
    }

    const data = await res.json();
    console.log("✅ getAllFreshPaginated response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in getAllFreshPaginated:", error.message);
    throw error;
  }
};

/**
 * Lấy sản phẩm theo ID
 * @param id - ID của sản phẩm
 * @returns Fresh object
 */
export const getFreshById = async (id: number): Promise<Fresh> => {
  try {
    const res = await fetch(`${API_URL}/freshs/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to fetch fresh product");
    }

    const data = await res.json();
    console.log("✅ getFreshById response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in getFreshById:", error.message);
    throw error;
  }
};

/**
 * Tìm kiếm sản phẩm
 * @param name - Tìm theo tên
 * @param description - Tìm theo description
 * @param category - Lọc theo category
 * @param region - Lọc theo khu vực
 * @returns Danh sách Fresh matching criteria
 */
export const searchFresh = async (
  name?: string,
  description?: string,
  category?: string,
  region?: string
): Promise<Fresh[]> => {
  try {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (description) params.append("description", description);
    if (category) params.append("category", category);
    if (region) params.append("region", region);

    const res = await fetch(`${API_URL}/freshs/search?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to search fresh products");
    }

    const data = await res.json();
    console.log("✅ searchFresh response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in searchFresh:", error.message);
    throw error;
  }
};

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
export const filterFresh = async (
  categories?: string[],
  featured?: boolean,
  unit?: string,
  minPrice?: number,
  maxPrice?: number,
  region?: string
): Promise<Fresh[]> => {
  try {
    const params = new URLSearchParams();

    if (categories && categories.length > 0) {
      categories.forEach(cat => params.append("categories", cat));
    }
    if (featured !== undefined) params.append("featured", featured.toString());
    if (unit) params.append("unit", unit);
    if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());
    if (region) params.append("region", region);

    const res = await fetch(`${API_URL}/freshs/filter?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to filter fresh products");
    }

    const data = await res.json();
    console.log("✅ filterFresh response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in filterFresh:", error.message);
    throw error;
  }
};
  try {
    const params: Record<string, any> = {};

    if (categories && categories.length > 0) {
      params.categories = categories;
    }
    if (featured !== undefined) {
      params.featured = featured;
    }
    if (unit) params.unit = unit;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (region) params.region = region;

    const res = await axios.get<Fresh[]>(`${API_URL}/freshs/filter`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Error in filterFresh:", error);
    throw error;
  }
};

export const FreshService = {
  getAllFreshPaginated,
  getFreshById,
  searchFresh,
  filterFresh,
};
