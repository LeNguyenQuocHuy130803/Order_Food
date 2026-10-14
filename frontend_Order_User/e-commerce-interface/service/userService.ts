
import type { UserDetail } from '@/types/user'
import { apiFetch, POST } from '@/lib/api/api-client-refresh'

/**
 * UserService - Lấy và quản lí user data
 * Chỉ liên quan đến việc fetch user info từ API
 * Dùng apiFetch với auto-refresh token interceptor
 */

/**
 * Get user detail by ID - gọi /api/users/{id} với token
 * Token sẽ gửi qua HTTP-Only cookies tự động
 * Nếu token hết hạn → interceptor tự động refresh
 */
export const getUserById = async (userId: number): Promise<UserDetail> => {
  try {
    console.log(`🔍 [userService] Fetching user details for ID: ${userId}`)
    
    const res = await apiFetch(`/api/users/${userId}`, { method: 'GET' })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch user')
    }
    
    const data = await res.json()
    
    console.log(`✅ [userService] User details fetched:`, {
      id: data.id,
      email: data.email,
      userName: data.userName,
      phoneNumber: data.phoneNumber,
      addresses: data.addresses,
      createdAt: data.createdAt,
    })
    
    return data
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
    
    const res = await apiFetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: formData,
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to update user')
    }

    const resData = await res.json()
    console.log(`✅ [userService] User updated:`, resData)
    return resData
  } catch (error) {
    console.error("❌ [userService] Error in updateUser:", error)
    throw error
  }
}

/**
 * Request password reset - send OTP to email
 * @param email - User email
 */
export const handle_forgotPassWord = async (email: string): Promise<{ message: string }> => {
  try {
    console.log(`📧 [userService] clicking forgot password for email: ${email}`)

    const res = await POST(`/api/auth/forgot-password`, { email })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Forgot password failed')
    }
    const data = await res.json()

    console.log(`✅ [userService] OTP sent to email:`, data.message)
    return data
  } catch (error) {
    console.error('❌ [userService] Error in handle_forgotPassWord:', error)
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

    const res = await POST(
      `/api/auth/reset-password`,
      {
        email,
        otp,
        newPassword,
      }
    )
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Reset password failed')
    }
    const data = await res.json()

    console.log(`✅ [userService] Password reset successfully:`, data.message)
    return data
  } catch (error) {
    console.error('❌ [userService] Error in resetPassword:', error)
    throw error
  }
}

export const sendChangePasswordOtp = async (): Promise<{ message: string; success: boolean }> => {
  try {
    console.log('📧 [userService] Sending change password OTP')

    const res = await apiFetch('/api/auth/change-password/send-otp', {
      method: 'POST',
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Failed to send OTP')
    }

    const data = await res.json()
    console.log('✅ [userService] OTP sent successfully:', data.message)
    return data
  } catch (error) {
    throw error
  }
}

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
  otp: string
): Promise<{ message: string; success?: boolean }> => {
  try {
    console.log('🔐 [userService] Changing password with OTP verification')

    const res = await apiFetch('/api/auth/change-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword, otp }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Change password failed')
    }

    const data = await res.json()
    console.log('✅ [userService] Password changed successfully:', data.message)
    return data
  } catch (error) {
    // Error will be handled and displayed as toast in component
    // No console.error here to avoid console pollution
    throw error
  }
}

export const userService = {
  getUserById,
  updateUser,
  changePassword,
  sendChangePasswordOtp,
}
