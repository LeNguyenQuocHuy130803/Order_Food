import { NextRequest, NextResponse } from 'next/server'

  // Nhận email + password từ frontend
  // Forward tới backend: POST /auth/login
  // Nhận token + user data
  // Set HTTP-only cookies ✅
  // Return user info
  
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      )
    }

    // ✅ Gọi backend login endpoint
    const backendRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!backendRes.ok) {
      const error = await backendRes.json()
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()

    // ✅ STEP 2: Tạo response với user info
    const res = NextResponse.json(
      {
        // ✅ Return CHỈ user info cho authorize()
        user: {
          id: data.id,
          email: data.email,
          username: data.username,
          roles: data.roles,
        },
      },
      { status: 200 }
    )

    // ✅ STEP 3: SET HTTP-ONLY COOKIES
    // Token được set ở server-side
    // Client không bao giờ biết token là gì
    res.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,        // 🔒 JS không thể truy cập
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',       // 🔒 CSRF protection
      maxAge: 3600,          // 1 hour
      path: '/',
    })

    if (data.refreshToken) {
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600, // 7 days
        path: '/',
      })
    }

    return res
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed: ' + error.message },
      { status: 500 }
    )
  }
}
