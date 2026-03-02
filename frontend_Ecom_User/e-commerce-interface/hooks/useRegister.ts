/**
 * useRegister Hook - Register functionality
 * FIX: Không reset form khi có lỗi
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api/api-client-advanced'

interface RegisterData {
  email: string
  userName: string
  password: string
  phoneNumber: string
}

interface RegisterResponse {
  accessToken: string
  id: number
  email: string
  username: string
  roles: string[]
  phonenumber: string
}

interface UseRegisterReturn {
  loading: boolean
  error: string | null
  success: boolean
  handleRegister: (data: RegisterData) => Promise<void>
  clearError: () => void
}

export function useRegister(): UseRegisterReturn {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (data: RegisterData) => {
    setError(null)
    setLoading(true)

    try {
      // apiClient sử dụng Axios - trả về data trực tiếp từ response interceptor
      const registerData: RegisterResponse = await apiClient.post('/auth/register', {
        email: data.email.trim(),
        userName: data.userName.trim(),
        password: data.password.trim(),
        phoneNumber: data.phoneNumber.trim(),
      })

      // Tự động login sau khi đăng ký
      localStorage.setItem('accessToken', registerData.accessToken)
      localStorage.setItem('userId', registerData.id.toString())
      localStorage.setItem('username', registerData.username)
      localStorage.setItem('roles', JSON.stringify(registerData.roles))

      setSuccess(true)

      // register thành công Redirect sau 1.5s , 
      setTimeout(() => {
        router.push('/login-page')
      }, 1500)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration error. Please try again'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    loading,
    error,
    success,
    handleRegister,
    clearError,
  }
}
