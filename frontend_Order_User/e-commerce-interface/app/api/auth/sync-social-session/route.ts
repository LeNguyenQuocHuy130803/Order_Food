import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Đồng bộ JWT Spring Boot từ NextAuth session sang HTTP-only cookies.
 * Hỗ trợ nhận token từ request body hoặc từ NextAuth JWT cookie.
 */
export async function POST(req: NextRequest) {
  let accessToken: string | undefined
  let refreshToken: string | undefined

  // Cách 1: Đọc từ request body nếu client gửi lên
  try {
    const body = await req.json()
    if (body?.accessToken && typeof body.accessToken === 'string') {
      accessToken = body.accessToken
      refreshToken = body.refreshToken
    }
  } catch {
    // Body rỗng hoặc không có JSON
  }

  // Cách 2: Nếu chưa có trong body, giải mã từ NextAuth JWT
  if (!accessToken) {
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      if (typeof token?.accessToken === 'string') {
        accessToken = token.accessToken
        refreshToken = token.refreshToken as string | undefined
      }
    } catch (e) {
      console.warn('[sync-social-session] Không thể giải mã qua getToken:', e)
    }
  }

  const response = NextResponse.json({ success: true })
  const isProduction = process.env.NODE_ENV === 'production'

  // Set HTTP-only cookie accessToken
  if (accessToken) {
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 giờ
      path: '/',
    })
  }

  // Set HTTP-only cookie refreshToken
  if (refreshToken) {
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 ngày — Tầng 1: Sliding Session
      path: '/',
    })
  }

  return response
}
