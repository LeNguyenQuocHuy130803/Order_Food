/**
 * API Route: POST /api/auth/refresh
 * ✅ Refreshes access token when it expires
 * ✅ Called from middleware or API interceptor
 * ✅ Retrieves refreshToken from HTTP-only cookie
 * ✅ Calls backend /auth/refresh-token
 * ✅ Updates HTTP-only cookies
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    // ✅ Lấy refreshToken từ cookie (server-side)
    const refreshToken = req.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token' },
        { status: 401 }
      )
    }

    // ✅ Gọi backend refresh endpoint
    const backendRes = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!backendRes.ok) {
      // ✅ Nếu refresh fail → xóa cookies + logout
      const res = NextResponse.json(
        { message: 'Refresh failed' },
        { status: 401 }
      )
      res.cookies.delete('accessToken')
      res.cookies.delete('refreshToken')
      return res
    }

    const data = await backendRes.json()

    // ✅ Update cookies với token mới
    const res = NextResponse.json(
      { message: 'Token refreshed' },
      { status: 200 }
    )

    res.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: false,  // 🔧 DEV: localhost HTTP không HTTPS, nên false
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    })

    if (data.refreshToken) {
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: false,  // 🔧 DEV: localhost HTTP không HTTPS, nên false
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600,
        path: '/',
      })
    }

    return res
  } catch (error: any) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { message: 'Refresh failed' },
      { status: 500 }
    )
  }
}
