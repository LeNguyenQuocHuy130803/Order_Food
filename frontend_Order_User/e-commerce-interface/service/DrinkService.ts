import axios from "axios";
import type { Drink, PaginatedDrinkResponse } from "@/types/drink";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * DrinkService - Tách logic API khỏi UI
 * Dùng Axios + async/await
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
    const res = await axios.get<PaginatedDrinkResponse>(
      `${API_URL}/drinks/paging`,
      {
        params: {
          page,
          size: pageSize,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error in getAllDrinksPaginated:", error);
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
    const res = await axios.get<Drink>(`${API_URL}/drinks/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error in getDrinkById:", error);
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
    const res = await axios.get<Drink[]>(`${API_URL}/drinks/search`, {
      params: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(region && { region }),
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error in searchDrinks:", error);
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
