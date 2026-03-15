'use client'

import { useSession, signOut } from 'next-auth/react'  // ✅ Import useSession và signOut từ NextAuth . 1 là lấy thông tin session, 1 là để logout

export interface Auth {  // định nghĩa kiểu trả về của hook useAuth
  user: {
    id: string
    name?: string | null
    email?: string | null
    roles?: string[]
  } | null   // nếu user đã login thì trả về các thông tin user như trên , nếu chưa login thì trả về null
  loading: boolean  // ✅ Thêm trạng thái loading để biết khi nào session đang được xác thực 
  isAuthenticated: boolean  // ✅ Thêm isAuthenticated để dễ dàng kiểm tra nếu user đã login hay chưa
  logout: () => Promise<void>   // ✅ Hàm logout để đăng xuất người dùng
}

export function useAuth(): Auth {   // export nó ra để các component khác có thể sử dụng , dùng để lấy thông tin user hiện tại và trạng thái xác thực đã đăng nhập hay chưa
  const { data: session, status } = useSession() // gọi useSession để lấy thông tin session hiện tại và dùng status để lấy : trạng thái xác thực (loading, authenticated, unauthenticated) 


  // hàm dưới để log out người dùng, xóa session và redirect về trang login
  const logout = async () => {
    // ✅ Gọi /api/auth/logout để xóa HTTP-only cookies
    await fetch('/api/auth/logout', { method: 'POST' })
    
    // ✅ Logout khỏi NextAuth
    await signOut({ callbackUrl: '/login-page' })
  }

return {
  user: session?.user || null,           // Lấy user từ session, nếu không có = null
  loading: status === 'loading',         // true nếu status = 'loading'
  isAuthenticated: status === 'authenticated', // true nếu status = 'authenticated'
  logout,                                 // Hàm logout bên trên
  }
}
