import type { Drink, PaginatedDrinkResponse } from "@/types/drink";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * DrinkService - Tách logic API khỏi UI
 * Dùng Fetch API + async/await (không cần auth token)
 * 🔒 API sản phẩm công khai - không cần authentication
 */

/**
 * Lấy danh sách sản phẩm có phân trang
 * @param page - Trang hiện tại (1-based)
 * @param pageSize - Số item trên 1 trang (mặc định 9)
 * @returns PaginatedDrinkResponse từ backend
 */
export const getAllDrinksPaginated = async (
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedDrinkResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

    const res = await fetch(`${API_URL}/drinks/paging?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to fetch drinks");
    }

    const data = await res.json();
    console.log("✅ getAllDrinksPaginated response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in getAllDrinksPaginated:", error.message);
    throw error;
  }
};

/**
 * Lấy sản phẩm theo ID
 * @param id - ID của sản phẩm
 * @returns Drink object
 */
export const getDrinkById = async (id: number): Promise<Drink> => {
  try {
    const res = await fetch(`${API_URL}/drinks/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to fetch drink");
    }

    const data = await res.json();
    console.log("✅ getDrinkById response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in getDrinkById:", error.message);
    throw error;
  }
};

/**
 * Tìm kiếm sản phẩm
 * @param name - Tìm theo tên
 * @param description - Tìm theo description
 * @param category - Lọc theo category
 * @param region - Lọc theo khu vực
 * @returns Danh sách Drink matching criteria
 */
export const searchDrinks = async (
  name?: string,
  description?: string,
  category?: string,
  region?: string
): Promise<Drink[]> => {
  try {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (description) params.append("description", description);
    if (category) params.append("category", category);
    if (region) params.append("region", region);

    const res = await fetch(`${API_URL}/drinks/search?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to search drinks");
    }

    const data = await res.json();
    console.log("✅ searchDrinks response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in searchDrinks:", error.message);
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
 * @returns Danh sách Drink matching filters
 */
export const filterDrinks = async (
  categories?: string[],
  featured?: boolean,
  unit?: string,
  minPrice?: number,
  maxPrice?: number,
  region?: string
): Promise<Drink[]> => {
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

    const res = await fetch(`${API_URL}/drinks/filter?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to filter drinks");
    }

    const data = await res.json();
    console.log("✅ filterDrinks response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in filterDrinks:", error.message);
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

    const res = await axios.get<Drink[]>(`${API_URL}/drinks/filter`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Error in filterDrinks:", error);
    throw error;
  }
};

export const DrinkService = {
  getAllDrinksPaginated,
  getDrinkById,
  searchDrinks,
  filterDrinks,
};
