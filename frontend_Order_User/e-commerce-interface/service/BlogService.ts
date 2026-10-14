import type { BlogPaginatedResponse, BlogPost } from "@/types/blog";
import { apiFetch } from "@/lib/api/api-client-refresh";

export const BlogService = {
  /**
   * 📰 Lấy danh sách bài viết blog với phân trang
   * @param page - Số trang (mặc định: 1)
   * @param size - Số bài viết mỗi trang (mặc định: 10)
   */
  async getBlogs(page: number = 1, size: number = 10): Promise<BlogPaginatedResponse> {
    console.log(`📰 [BlogService] Fetching blogs - page: ${page}, size: ${size}`);
    
    try {
      const response = await apiFetch(`/api/blogs?page=${page}&size=${size}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: BlogPaginatedResponse = await response.json();
      console.log(`✅ [BlogService] Got ${data.data.length} blogs`);
      return data;
    } catch (error) {
      console.error(`❌ [BlogService] Error fetching blogs:`, error);
      throw error;
    }
  },

  /**
   * 📄 Lấy chi tiết một bài viết blog theo ID
   * @param id - ID của bài viết
   */
  async getBlogById(id: number): Promise<BlogPost> {
    console.log(`📄 [BlogService] Fetching blog detail - id: ${id}`);
    
    try {
      const response = await apiFetch(`/api/blogs/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: BlogPost = await response.json();
      console.log(`✅ [BlogService] Got blog detail:`, data.title);
      return data;
    } catch (error) {
      console.error(`❌ [BlogService] Error fetching blog ${id}:`, error);
      throw error;
    }
  },
};
