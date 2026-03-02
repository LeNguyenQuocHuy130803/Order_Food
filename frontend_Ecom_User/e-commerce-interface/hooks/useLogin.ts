/**
 * useLogin Hook - Encapsulate login logic
 * Handles login, validation, error handling, and state management
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, type LoginCredentials } from '@/service/authService'
import { useAuth } from '@/app/providers'

interface UseLoginReturn {
  loading: boolean
  error: string | null
  success: boolean
  handleLogin: (credentials: LoginCredentials) => Promise<void>
  clearError: () => void
  clearSuccess: () => void
}

/**
 * Custom hook for login functionality
 */
export function useLogin(): UseLoginReturn {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Validate login credentials
   */
  const validateCredentials = (credentials: LoginCredentials): boolean => {
    if (!credentials.email.trim()) {
      setError('Vui lòng nhập email')
      return false
    }

    if (!credentials.password.trim()) {
      setError('Vui lòng nhập mật khẩu')
      return false
    }

    if (credentials.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return false
    }

    return true
  }

  /**
   * Handle login request
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    setError(null)

    if (!validateCredentials(credentials)) {
      return
    }

    setLoading(true)

    try {
      const response = await authService.loginUser(credentials)

      // Save user data
      authService.saveUserData(response)
      refreshUser()

      setSuccess(true)

      // Redirect after 1.5s
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Lỗi đăng nhập. Vui lòng thử lại'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)
  const clearSuccess = () => setSuccess(false)

  return {
    loading,
    error,
    success,
    handleLogin,
    clearError,
    clearSuccess,
  }
}
