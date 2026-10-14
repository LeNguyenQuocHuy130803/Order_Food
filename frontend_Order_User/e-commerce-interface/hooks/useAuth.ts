'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { signOut, useSession } from 'next-auth/react'
import { authService } from '@/service/authService'
import type { AuthUser } from '@/types/user'



export interface Auth {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

export function useAuth(): Auth {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancelled = false

    const syncCurrentUser = () => {
      // ✅ Lấy user từ localStorage khi component mount hoặc auth thay đổi
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
      setLoading(false)

      // Kiểm tra nếu chưa login
      if (!currentUser) {
        console.log('ℹ️ [useAuth] User not authenticated')
      } else {
        console.log('✅ [useAuth] User authenticated:', currentUser.userName)
      }
    }

    const syncSocialLogin = async () => {
      if (!session?.user?.id) {
        syncCurrentUser()
        return
      }

      setLoading(true)

      const socialUser: AuthUser = {
        id: Number(session.user.id),
        userName: session.user.name || '',
        email: session.user.email || '',
        roles: session.user.roles?.length ? session.user.roles : ['CUSTOMER'],
        avatar: session.user.avatar || undefined,
      }

      try {
        await fetch('/api/auth/sync-social-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          }),
          credentials: 'include',
        })
      } catch (error) {
        console.warn('Lỗi khi gọi sync-social-session:', error)
      }

      if (!cancelled) {
        // Giữ một nguồn dữ liệu tương thích với các phần UI cũ đang đọc localStorage.
        authService.saveUserData(socialUser)
        setUser(socialUser)
        setLoading(false)
      }
    }

    if (status !== 'loading') {
      void syncSocialLogin()
    }
    window.addEventListener(authService.AUTH_USER_CHANGE_EVENT, syncCurrentUser)

    return () => {
      cancelled = true
      window.removeEventListener(authService.AUTH_USER_CHANGE_EVENT, syncCurrentUser)
    }
  }, [session?.user?.avatar, session?.user?.email, session?.user?.id, session?.user?.name, session?.user?.roles, status])

  const logout = async () => {
    setUser(null)

    // 🗑️ Clear all React Query cache khi logout
    // Giúp tránh những request cũ bị gửi sau logout
    console.log('🗑️ [useAuth] Clearing React Query cache...')
    queryClient.clear()

    console.log('🚪 [useAuth] Logging out...')
    await signOut({ redirect: false })
    await authService.logout()
    router.push('/')
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }
}
