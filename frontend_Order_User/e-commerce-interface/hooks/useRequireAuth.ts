'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * 🔒 Tầng 3: Auth Guard cho trang riêng tư
 * 
 * Hook này KHÔNG redirect ngay mà chờ useAuth xong loading rồi mới kiểm tra.
 * Nếu user chưa login → hiện thông báo nhẹ nhàng rồi redirect về /login.
 * 
 * Cách dùng:
 *   const { user, loading } = useRequireAuth()
 *   if (loading) return <LoadingSpinner />
 *   // ... render trang bình thường
 * 
 * @param redirectTo - Đường dẫn redirect khi chưa login (mặc định: '/login')
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const auth = useAuth()
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Chờ useAuth load xong
    if (auth.loading) return

    // Nếu đã redirect rồi thì không làm lại
    if (hasRedirected.current) return

    // Nếu chưa login → redirect nhẹ nhàng
    if (!auth.isAuthenticated) {
      hasRedirected.current = true
      console.warn('🔒 [useRequireAuth] Trang này yêu cầu đăng nhập. Chuyển hướng...')
      router.replace(redirectTo)
    }
  }, [auth.loading, auth.isAuthenticated, redirectTo, router])

  return auth
}
