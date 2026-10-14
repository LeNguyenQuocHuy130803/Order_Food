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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * 🧹 Dọn dẹp phiên đăng nhập êm thầm (Silent Cleanup)
 * 
 * Tầng 2: Khi phiên hết hạn, hệ thống âm thầm:
 *   1. Xóa NextAuth session (KHÔNG redirect)
 *   2. Xóa localStorage
 *   3. Báo cho useAuth cập nhật giao diện (hiện nút Login)
 * 
 * ⚠️ KHÔNG dùng console.error, KHÔNG throw Error
 *    → Tránh bảng đỏ Next.js Dev Overlay
 */
async function silentCleanup() {
  try {
    await signOut({ redirect: false })
  } catch {
    // Bỏ qua lỗi signOut — không quan trọng
  }

  // Xóa sạch cookie hết hạn trên trình duyệt
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Bỏ qua
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    localStorage.removeItem('roles')
    localStorage.removeItem('avatar')
    // Báo cho useAuth biết user đã hết phiên → UI tự cập nhật
    window.dispatchEvent(new Event('auth-user-change'))
  }
}

/**
 * 🔄 Gọi API refresh để lấy access token mới
 * 
 * Tầng 1 + 2: Sliding Session + Silent Logout
 * 
 * Trả về:
 *   - true  → Refresh thành công, cookie đã được cập nhật
 *   - false → Refresh thất bại, đã dọn dẹp phiên êm thầm
 * 
 * ⚠️ Hàm này KHÔNG BAO GIỜ throw Error
 *    → Tránh crash ứng dụng & bảng đỏ Next.js
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    console.warn('🔄 Phiên đăng nhập đã hết hạn, đang thử gia hạn...')

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      // Refresh thất bại → Đây là chuyện BÌNH THƯỜNG (phiên quá cũ)
      // Xử lý êm thầm, KHÔNG báo lỗi
      console.warn('ℹ️ Phiên đã hết hạn, chuyển sang chế độ khách vãng lai...')
      await silentCleanup()
      return false
    }

    console.log('✅ Gia hạn phiên đăng nhập thành công!')
    return true
  } catch {
    // Lỗi mạng hoặc server chết → cũng dọn dẹp êm thầm
    console.warn('ℹ️ Không thể gia hạn phiên (lỗi kết nối), chuyển sang chế độ khách...')
    await silentCleanup()
    return false
  }
}

/**
 * 🎣 Wrapper chính cho fetch() với auto-refresh
 * 
 * Tầng 1 + 2: Sliding Session + Silent Logout
 * 
 * Cách hoạt động:
 *   1. Gửi request API bình thường
 *   2. Nếu 401 (token hết hạn):
 *      a. Nếu chưa refresh → gọi refreshAccessToken()
 *      b. Nếu đang refresh → chờ trong queue
 *   3. Nếu refresh thành công → thử lại request gốc
 *   4. Nếu refresh thất bại → trả về response 401 bình thường
 * 
 * ⚠️ Hàm này KHÔNG BAO GIỜ throw Error khi token hết hạn
 *    → Service layer sẽ kiểm tra res.ok và xử lý phù hợp
 *    → React Query sẽ nhận error từ service, không từ đây
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
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

      const success = await refreshAccessToken()
      isRefreshing = false

      if (success) {
        // ✅ Refresh thành công → thông báo cho queue và thử lại
        processQueue(null)

        // 3️⃣ Thử lại request gốc với token mới
        response = await fetch(url, {
          ...options,
          credentials: 'include',
        })
      } else {
        // ❌ Refresh thất bại → thông báo cho queue
        // Dùng null thay vì error → queue sẽ resolve bình thường
        // Mỗi request trong queue tự retry và nhận 401 → service xử lý
        processQueue(null)
        // Trả về response 401 gốc — KHÔNG throw Error
        // Service layer sẽ thấy res.ok === false và xử lý
      }
    } else {
      // ✅ Đang có request khác refresh → Đứng vào queue chờ
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          resolve: () => {
            // 🔄 Khi nhận được thông báo → thử lại request
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
