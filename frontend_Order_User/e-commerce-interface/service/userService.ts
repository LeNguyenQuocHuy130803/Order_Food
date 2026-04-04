
import axios from "axios"
import type { UserDetail } from "@/types/user"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

/**
 * UserService - Lấy và quản lí user data
 * Chỉ liên quan đến việc fetch user info từ API
 * Dùng axios + async/await
 */

/**
 * Get user detail by ID - gọi /api/users/{id} với token
 * Token sẽ gửi qua HTTP-Only cookies tự động (credentials: include)
 */
export const getUserById = async (userId: number): Promise<UserDetail> => {
  try {
    console.log(`🔍 [userService] Fetching user details for ID: ${userId}`)
    
    const res = await axios.get<UserDetail>(
      `/api/users/${userId}`,
      {
        withCredentials: true,  // 🔒 Gửi token qua cookies tự động
      }
    )
    
    console.log(`✅ [userService] User details fetched:`, {
      id: res.data.id,
      email: res.data.email,
      userName: res.data.userName,
      phoneNumber: res.data.phoneNumber,
      addresses: res.data.addresses?.length || 0,
      createdAt: res.data.createdAt,
    })
    
    return res.data
  } catch (error) {
    console.error("❌ [userService] Error in getUserById:", error)
    throw error
  }
}


export const userService = {
  getUserById,
}
