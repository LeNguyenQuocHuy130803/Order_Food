/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios, { type InternalAxiosRequestConfig } from 'axios'

// Sửa URL cho phù hợp với backend
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
// REQUEST INTERCEPTOR - Gắn token vào request
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
// RESPONSE INTERCEPTOR - Xử lý error đơn giản
// ========================================
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Không redirect tự động cho login/register request
    if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/register') {
      return Promise.reject(error)
    }

    // Nếu bị 401 hoặc 403 - lỗi authentication
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Authentication failed, redirecting to login')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('roles')
      window.location.href = '/login-page'
      return Promise.reject(error)
    }

    // Với các lỗi khác, chỉ reject
    return Promise.reject(error)
  }
)

export default apiClient
