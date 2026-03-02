/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios, { type InternalAxiosRequestConfig } from 'axios'

// Sửa URL cho phù hợp với backend (localhost:8080 cho development)
const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Extend config type để hỗ trợ skipAuth
interface AxiosConfigWithAuth extends InternalAxiosRequestConfig {
  skipAuth?: boolean
}

const apiClient = Axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ========================================
// REQUEST INTERCEPTOR - Tự động gắn token vào request
// ========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const configWithAuth = config as AxiosConfigWithAuth

    // Lấy access token từ localStorage
    const access_token = localStorage.getItem('accessToken')

    if (config.headers === undefined) {
      config.headers = new Axios.AxiosHeaders()
    }

    // Gắn Authorization header nếu có token và không skip
    if (access_token && !configWithAuth.skipAuth) {
      config.headers.Authorization = `Bearer ${access_token}`
    }

    config.headers.Accept = 'application/json'

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ========================================
// REFRESH TOKEN FUNCTION - Làm mới access token khi hết hạn
// ========================================
const refreshToken = async () => {
  try {
    // Lấy refresh token từ localStorage
    const refresh_token = localStorage.getItem('refreshToken')

    if (!refresh_token) {
      console.error('No refresh token available')
      return null
    }

    // Tạo axios instance mới để tránh infinite loop từ interceptor
    const refreshApiClient = Axios.create({
      baseURL: URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Gọi endpoint refresh token
    const response: any = await refreshApiClient.post('/auth/refresh-token', {
      refreshToken: refresh_token,
    })

    if (!response || !response.data || !response.data.accessToken) {
      console.error('Invalid refresh token response')
      return null
    }

    // Lưu token mới
    localStorage.setItem('accessToken', response.data.accessToken)
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken)
    }

    return response.data.accessToken
  } catch (error: any) {
    console.error('Failed to refresh token:', error)
    // Nếu refresh token không hợp lệ (401/403), xóa storage và chuyển hướng
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('roles')
      window.location.href = '/login-page'
    }
    return null
  }
}

// ========================================
// RESPONSE INTERCEPTOR - Xử lý error và token refresh
// ========================================

// Flag để tránh gọi refresh token nhiều lần cùng lúc
let isRefreshing = false
// Hàng đợi các request đang chờ token mới
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Không redirect tự động cho login request khi bị lỗi
    if (originalRequest.url === '/auth/login') {
      return Promise.reject(error)
    }

    // Không retry cho refresh token request
    if (originalRequest.url === '/auth/refresh-token') {
      return Promise.reject(error)
    }

    // Kiểm tra lỗi auth (401 hoặc 403) và chưa retry
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newAccessToken = await refreshToken()

        if (newAccessToken) {
          // Cập nhật header và retry request
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

          // Xử lý các request trong hàng đợi
          processQueue(null, newAccessToken)

          return apiClient(originalRequest)
        } else {
          // Nếu refresh thất bại
          processQueue(error, null)
          console.error('Unable to refresh token, redirecting to login')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login-page'
          return Promise.reject(error)
        }
      } catch (refreshError: any) {
        console.error('Refresh token failed:', refreshError)
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login-page'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Với các lỗi khác, chỉ reject
    return Promise.reject(error)
  }
)

export default apiClient
