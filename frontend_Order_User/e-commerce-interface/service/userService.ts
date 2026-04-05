
import apiClient from '@/lib/apiClient'
import type { UserDetail } from '@/types/user'

/**
 * UserService - Lấy và quản lí user data
 * Chỉ liên quan đến việc fetch user info từ API
 * Dùng apiClient (axios) với auto-refresh token interceptor
 */

/**
 * Get user detail by ID - gọi /api/users/{id} với token
 * Token sẽ gửi qua HTTP-Only cookies tự động
 * Nếu token hết hạn → interceptor tự động refresh
 */
export const getUserById = async (userId: number): Promise<UserDetail> => {
  try {
    console.log(`🔍 [userService] Fetching user details for ID: ${userId}`)
    
    const res = await apiClient.get<UserDetail>(
      `/users/${userId}`
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
