/**
 * API Client với Auto-Refresh Token Interceptor
 * 
 * Khi token hết hạn (401):
 * 1. Bắt lỗi 401
 * 2. Gọi /api/auth/refresh để lấy token mới
 * 3. Gửi lại request cũ với token mới
 */

import axios, { AxiosError, AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // 🔒 Gửi cookies tự động
})

// Flag để tránh gọi refresh nhiều lần cùng lúc
let isRefreshing = false
let failedQueue: Array<{
  onSuccess: (token: string) => void
  onFailed: (error: AxiosError) => void
}> = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error)
    }
  })

  failedQueue = []
}

/**
 * Response Interceptor - Xử lý lỗi 401 (token expired)
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Nếu lỗi không phải 401 hoặc đã retry rồi → throw error
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Nếu đang gọi refresh rồi → thêm vào queue
    if (isRefreshing) {
      return new Promise((onSuccess, onFailed) => {
        failedQueue.push({ onSuccess, onFailed })
      }).then(() => {
        // Gửi lại request cũ
        return apiClient(originalRequest)
      })
    }

    // Bắt đầu refresh token
    isRefreshing = true
    originalRequest._retry = true

    try {
      console.log('🔄 [apiClient] Token expired, calling refresh...')

      // Gọi refresh endpoint
      await axios.post(
        '/api/auth/refresh',
        {},
        {
          withCredentials: true,
        }
      )

      console.log('✅ [apiClient] Token refreshed successfully')
      isRefreshing = false

      // Process queue
      processQueue(null)

      // Gửi lại request cũ
      return apiClient(originalRequest)
    } catch (refreshError) {
      console.error('❌ [apiClient] Refresh failed, logging out...')

      isRefreshing = false

      // Refresh fail → logout
      processQueue(refreshError as AxiosError)

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login-page'
      }

      return Promise.reject(refreshError)
    }
  }
)

export default apiClient
