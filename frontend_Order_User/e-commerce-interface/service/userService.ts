
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
      addresses: res.data.addresses,
      createdAt: res.data.createdAt,
    })
    
    return res.data
  } catch (error) {
    console.error("❌ [userService] Error in getUserById:", error)
    throw error
  }
}


// edit user 
export const updateUser = async (userId: number, data: Partial<UserDetail>, avatarFile?: File): Promise<UserDetail> => {
  try {
    console.log(`🔍 [userService] Updating user ID: ${userId} with data:`, data)
    
    // Convert to FormData for file upload support
    const formData = new FormData()
    
    // Add fields
    if (data.userName) formData.append('userName', data.userName)
    if (data.email) formData.append('email', data.email)
    if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber)
    
    // Add avatar file if provided
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }
    
    const res = await apiClient.patch<UserDetail>(
      `/users/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    console.log(`✅ [userService] User updated:`, res.data)
    return res.data
  } catch (error) {
    console.error("❌ [userService] Error in updateUser:", error)
    throw error
  }
}

export const userService = {
  getUserById,
  updateUser,
}

/**
 * Change user password
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 */
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    console.log(`🔐 [userService] Changing password for user ID: ${userId}`)

    const res = await apiClient.post<{ message: string }>(
      `/users/${userId}/change-password`,
      {
        currentPassword,
        newPassword,
      }
    )

    console.log(`✅ [userService] Password changed successfully:`, res.data.message)
    return res.data
  } catch (error) {
    console.error('❌ [userService] Error in changePassword:', error)
    throw error
  }
}

/**
 * Request password reset - send OTP to email
 * @param email - User email
 */
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  try {
    console.log(`📧 [userService] Requesting password reset for email: ${email}`)

    const res = await apiClient.post<{ message: string }>(
      `/auth/forgot-password`,
      { email }
    )

    console.log(`✅ [userService] OTP sent to email:`, res.data.message)
    return res.data
  } catch (error) {
    console.error('❌ [userService] Error in requestPasswordReset:', error)
    throw error
  }
}

/**
 * Reset password with OTP
 * @param email - User email
 * @param otp - OTP from email
 * @param newPassword - New password
 */
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    console.log(`🔐 [userService] Resetting password for email: ${email}`)

    const res = await apiClient.post<{ message: string }>(
      `/auth/reset-password`,
      {
        email,
        otp,
        newPassword,
      }
    )

    console.log(`✅ [userService] Password reset successfully:`, res.data.message)
    return res.data
  } catch (error) {
    console.error('❌ [userService] Error in resetPassword:', error)
    throw error
  }
}
