import type { Food, PaginatedFoodResponse } from "@/types/food";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * FoodService - Tách logic API khỏi UI
 * Dùng Fetch API + async/await (không cần auth token)
 * 🔒 API sản phẩm công khai - không cần authentication
 */

/**
 * Lấy danh sách sản phẩm có phân trang
 * @param page - Trang hiện tại (1-based)
 * @param pageSize - Số item trên 1 trang (mặc định 9)
 * @returns PaginatedFoodResponse từ backend
 */
export const getAllFoodsPaginated = async (
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedFoodResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

    const res = await fetch(`${API_URL}/foods/paging?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // 🔒 Không gửi cookies - API public
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to fetch foods");
    }

    const data = await res.json();
    console.log("✅ getAllFoodsPaginated response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in getAllFoodsPaginated:", error.message);
    throw error;
  }
};

/**
 * Lấy sản phẩm theo ID
 * @param id - ID của sản phẩm
 * @returns Food object
 */
export const getFoodById = async (id: number): Promise<Food> => {
  try {
    const res = await fetch(`${API_URL}/foods/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // 🔒 Không gửi cookies - API public
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to fetch food");
    }

    const data = await res.json();
    console.log("✅ getFoodById response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in getFoodById:", error.message);
    throw error;
  }
};

/**
 * Tìm kiếm sản phẩm
 * @param name - Tìm theo tên
 * @param description - Tìm theo description
 * @param category - Lọc theo category
 * @param region - Lọc theo khu vực
 * @returns Danh sách Food matching criteria
 */
export const searchFoods = async (
  name?: string,
  description?: string,
  category?: string,
  region?: string
): Promise<Food[]> => {
  try {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (description) params.append("description", description);
    if (category) params.append("category", category);
    if (region) params.append("region", region);

    const res = await fetch(`${API_URL}/foods/search?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to search foods");
    }

    const data = await res.json();
    console.log("✅ searchFoods response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in searchFoods:", error.message);
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
 * @returns Danh sách Food matching filters
 */
export const filterFoods = async (
  categories?: string[],
  featured?: boolean,
  unit?: string,
  minPrice?: number,
  maxPrice?: number,
  region?: string
): Promise<Food[]> => {
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

    const res = await fetch(`${API_URL}/foods/filter?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Failed to filter foods");
    }

    const data = await res.json();
    console.log("✅ filterFoods response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error in filterFoods:", error.message);
    throw error;
  }
};

export const FoodService = {
  getAllFoodsPaginated,
  getFoodById,
  searchFoods,
  filterFoods,
};
