'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, type AuthUser } from '@/service/authService'

export interface Auth {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

export function useAuth(): Auth {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // ✅ Lấy user từ localStorage khi component mount
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)

    // Kiểm tra nếu chưa login
    if (!currentUser) {
      console.log('ℹ️ [useAuth] User not authenticated')
    } else {
      console.log('✅ [useAuth] User authenticated:', currentUser.username)
    }
  }, [])   // Chỉ chạy 1 lần khi component mount ( tức là componen nào dùng nó thì nó sẽ chạy 1 lần khi component đó mount)

  const logout = async () => {
    console.log('🚪 [useAuth] Logging out...')
    await authService.logout()
    setUser(null)
    router.push('/')
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }
}
