/**
 * Auth Service - Gọi backend Spring Boot JWT API
 * Tokens lưu ở HTTP-Only Cookies (server-side, bảo mật)
 * User info lưu ở localStorage (safe)
 */

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  id: number
  email: string
  username: string
  roles: string[]
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  roles: string[]
  avatar?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

/**
 * Login user - gọi /api/auth/login (route.ts)
 * route.ts sẽ forward tới backend Spring Boot
 * route.ts sẽ set HTTP-Only cookies
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthUser> {
  const sanitizedCredentials = {
    email: credentials.email.trim(),
    password: credentials.password.trim(),
  }

  try {
    console.log(`🚀 [authService] Calling /api/auth/login`)
    
    // ✅ Gọi route.ts thay vì backend trực tiếp
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedCredentials),
      credentials: 'include', // 🔒 Gửi cookies
    })

    console.log(`📡 [authService] Response status: ${response.status}`)

    if (!response.ok) {
      const error = await response.json()
      console.error(`❌ [authService] Error:`, error)
      throw new Error(error.message || 'Login failed')
    }

    // ✅ route.ts trả về user info (tokens ở cookies)
    const data = await response.json()
    console.log(`✅ [authService] Login success:`, {
      id: data.user.id,
      email: data.user.email,
      username: data.user.username,
      roles: data.user.roles,
        avatar: data.user.avatar,
    })
    
    return data.user
  } catch (error: any) {
    const errorMessage = error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác'
    console.error(`❌ [authService] Exception:`, errorMessage)
    throw new Error(errorMessage)
  }
}

/**
 * Lưu user data vào localStorage (CHỈ user info)
 * Tokens lưu ở HTTP-Only Cookies (server-side)
 */
export function saveUserData(user: AuthUser): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('userId', user.id.toString())
  localStorage.setItem('username', user.username)
  localStorage.setItem('email', user.email)
  localStorage.setItem('roles', JSON.stringify(user.roles))
  if (user.avatar) {
    localStorage.setItem('avatar', user.avatar)
  }
  
  console.log(`💾 [authService] User data saved to localStorage`)
}

/**
 * Lấy current user từ localStorage
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const userId = localStorage.getItem('userId')
  const username = localStorage.getItem('username')
  const email = localStorage.getItem('email')
  const roles = localStorage.getItem('roles')
  const avatar = localStorage.getItem('avatar')

  if (!userId || !username) return null

  return {
    id: parseInt(userId, 10),
    username,
    email: email || '',
    roles: roles ? JSON.parse(roles) : [],
    avatar: avatar || undefined,
  }
}

/**
 * Logout user - xóa localStorage + cookies
 */
export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return

  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  localStorage.removeItem('email')
  localStorage.removeItem('roles')
  localStorage.removeItem('avatar')
  
  // ✅ Call logout route để clear cookies
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout request failed:', error)
  }

  console.log(`🚪 [authService] User logged out`)
}

/**
 * Check user đã authenticate hay chưa
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('userId')
}

export const authService = {
  loginUser,
  getCurrentUser,
  saveUserData,
  logout,
  isAuthenticated,
}
