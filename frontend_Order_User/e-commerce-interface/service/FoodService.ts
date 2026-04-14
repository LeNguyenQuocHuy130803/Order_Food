import axios from "axios";
import type { Food, PaginatedFoodResponse } from "@/types/food";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * FoodService - Tách logic API khỏi UI
 * Dùng Axios + async/await
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
    const res = await axios.get<PaginatedFoodResponse>(
      `${API_URL}/foods/paging`,
      {
        params: {
          page,
          size: pageSize,
        },
      }
    );
    console.log("getAllFoodsPaginated response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error in getAllFoodsPaginated:", error);
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
    const res = await axios.get<Food>(`${API_URL}/foods/${id}`);
    console.log("getFoodById response nef huy:", res.data);
    return res.data;
    
  } catch (error) {
    console.error("Error in getFoodById:", error);
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
    const res = await axios.get<Food[]>(`${API_URL}/foods/search`, {
      params: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(region && { region }),
      },
    });
    console.log("searchFoods response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error in searchFoods:", error);
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

    const res = await axios.get<Food[]>(`${API_URL}/foods/filter`, {
      params,
    });
    console.log("filterFoods response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error in filterFoods:", error);
    throw error;
  }
};

export const FoodService = {
  getAllFoodsPaginated,
  getFoodById,
  searchFoods,
  filterFoods,
};
