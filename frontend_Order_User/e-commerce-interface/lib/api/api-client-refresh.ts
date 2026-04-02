/**
 * API Client với Auto-Refresh Token
 * ✅ Tự động làm mới token khi hết hạn (401)
 * ✅ Tự động thử lại request sau khi refresh
 * ✅ Tự động logout nếu refresh fail
 */

import { signOut } from 'next-auth/react'

// 🚩 Cờ kiểm soát: đang refresh token không?
// Dùng để tránh gọi /api/auth/refresh nhiều lần cùng lúc
let isRefreshing = false

// 📋 Hàng đợi (queue) lưu các request đang chờ token mới
// Khi token refresh xong, sẽ thông báo cho tất cả request này
let failedRequestsQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

/**
 * 📢 Thông báo cho các request trong hàng đợi
 * 
 * Nếu refresh thành công:
 *   - resolve() được gọi → các request trong queue được retry
 * 
 * Nếu refresh thất bại:
 *   - reject() được gọi → logout user
 */
const processQueue = (error: any, token: string | null = null) => {
  // 🔄 Duyệt qua tất cả request trong queue
  failedRequestsQueue.forEach(request => {
    if (error) {
      // ❌ Refresh fail → reject (async error)
      request.reject(error)
    } else {
      // ✅ Refresh success → resolve (tiếp tục)
      request.resolve(token!)
    }
  })

  // 🗑️ Xóa sạch queue sau khi xử lý
  failedRequestsQueue = []
}

/**
 * 🔄 Gọi API refresh để lấy access token mới
 * 
 * Gọi: POST /api/auth/refresh
 * Endpoint này sẽ:
 *   1. Lấy refreshToken từ HttpOnly cookie
 *   2. Gọi backend /auth/refresh-token
 *   3. Update cookies với token mới
 */
async function refreshAccessToken() {
  try {
    console.log('🔄 Đang refresh token...')
    
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      // ❌ Refresh fail → logout user
      console.error('❌ Refresh token thất bại, logout user...')
      await signOut({ callbackUrl: '/login-page' })
      throw new Error('Token refresh failed')
    }

    console.log('✅ Token refresh thành công!')
    return res
  } catch (error) {
    console.error('❌ Lỗi khi refresh token:', error)
    throw error
  }
}

/**
 * 🎣 Wrapper chính cho fetch() với auto-refresh
 * 
 * Cách hoạt động:
 *   1. Gọi API bình thường
 *   2. Nếu 401 (token hết hạn):
 *      a. Nếu chưa refresh → gọi refreshAccessToken()
 *      b. Nếu đang refresh → chờ trong queue
 *   3. Update token mới
 *   4. Thử lại request
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // 1️⃣ Gửi request đầu tiên
    let response = await fetch(url, {
      ...options,
      credentials: 'include', // 🔒 Gửi cả cookies
    })

    // 2️⃣ Kiểm tra: Token hết hạn? (401 Unauthorized)
    if (response.status === 401) {
      console.warn('⚠️ Token hết hạn (401), chuẩn bị refresh...')

      // 🚩 Kiểm tra: có đang refresh token không?
      if (!isRefreshing) {
        // ✅ Chưa refresh → Bắt đầu refresh
        isRefreshing = true
        console.log('🔄 Bắt đầu refresh token (request đầu tiên)')

        try {
          // 🔄 Gọi API refresh token
          await refreshAccessToken()
          
          // ✅ Refresh thành công → tắt cờ
          isRefreshing = false
          
          // 📢 Thông báo cho tất cả request trong queue
          processQueue(null)

          // 3️⃣ Thử lại request gốc với token mới
          console.log('🔄 Thử lại request gốc...')
          response = await fetch(url, {
            ...options,
            credentials: 'include',
          })
        } catch (error) {
          // ❌ Refresh fail → tắt cờ
          isRefreshing = false
          
          // 📢 Thông báo cho queue: lỗi rồi!
          processQueue(error)
          throw error
        }
      } else {
        // ✅ Đang có request khác refresh → Đứng vào queue
        console.log('⏳ Có request khác đang refresh, đứng vào queue...')
        
        return new Promise((resolve, reject) => {
          // Thêm request hiện tại vào hàng đợi
          failedRequestsQueue.push({
            resolve: () => {
              // 🔄 Khi nhận được thông báo → thử lại request
              console.log('✅ Nhận được token mới từ queue, retry request...')
              return fetch(url, {
                ...options,
                credentials: 'include',
              }).then(resolve).catch(reject)
            },
            reject,
          })
        })
      }
    }

    return response
  } catch (error) {
    console.error('❌ Lỗi API:', error)
    throw error
  }
}

/**
 * GET request với auto-refresh
 * 
 * Cách dùng:
 *   const res = await GET('/api/users')
 *   const data = await res.json()
 */
export async function GET(url: string, options: RequestInit = {}) {
  return apiFetch(url, { ...options, method: 'GET' })
}

/**
 * POST request với auto-refresh
 * 
 * Cách dùng:
 *   const res = await POST('/api/users', { name: 'John' })
 */
export async function POST(url: string, data?: any, options: RequestInit = {}) {
  return apiFetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request với auto-refresh
 * 
 * Cách dùng:
 *   const res = await PUT('/api/users/1', { name: 'Jane' })
 */
export async function PUT(url: string, data?: any, options: RequestInit = {}) {
  return apiFetch(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request với auto-refresh
 * 
 * Cách dùng:
 *   const res = await DELETE('/api/users/1')
 */
export async function DELETE(url: string, options: RequestInit = {}) {
  return apiFetch(url, { ...options, method: 'DELETE' })
}
