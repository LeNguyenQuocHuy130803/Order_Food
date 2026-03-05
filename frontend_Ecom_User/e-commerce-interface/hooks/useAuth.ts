'use client'

import { useSession, signOut } from 'next-auth/react'

export interface Auth {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    roles?: string[]
  } | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

export function useAuth(): Auth {
  const { data: session, status } = useSession()

  const logout = async () => {
    // ✅ Gọi /api/auth/logout để xóa HTTP-only cookies
    await fetch('/api/auth/logout', { method: 'POST' })
    
    // ✅ Logout khỏi NextAuth
    await signOut({ callbackUrl: '/login-page' })
  }

  return {
    user: session?.user || null,
    loading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    logout,
  }
}
