import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/auth/login
 * 
 * FLOW:
 * Frontend (loginForm) 
 *   ↓ gửi email + password
 *   ↓
 * Route này (proxy server)
 *   ↓ forward tới backend Spring Boot
 *   ↓
 * Backend trả về: accessToken + refreshToken + user data
 *   ↓
 * Route này:
 *   1️⃣ SET HTTP-only cookies (tokens) - bảo mật
 *   2️⃣ Return user info (không return tokens)
 *
 * ✅ Tại sao cần route này?
 * - Tokens không được phép lưu localStorage (XSS vulnerability)
 * - Server-side cookies là bảo mật nhất (không thể bị JS access)
 * - Route này che giấu backend URL từ frontend JS code
 */
  
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ STEP 1: Nhận email + password từ frontend
    const { email, password } = await req.json()

    // 2️⃣ Validate: Kiểm tra email + password có đủ không
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      )
    }

    // 3️⃣ STEP 2: Forward request tới backend Spring Boot
    // ✅ Route này là PROXY - che giấu backend từ frontend JS
    console.log(`🚀 Calling backend: ${API_URL}/auth/login`)
    
    // 4️⃣ POST request tới backend
    const backendRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    console.log(`📡 Backend response status: ${backendRes.status}`)

    // 5️⃣ Nếu backend trả về lỗi
    if (!backendRes.ok) {
      const error = await backendRes.json()
      console.error(`❌ Backend error:`, error)
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: backendRes.status }
      )
    }

    // 6️⃣ STEP 3: Backend trả về response thành công
    // Response format: { id, email, username, roles, avatar, accessToken, refreshToken }
    const data = await backendRes.json()

    // 7️⃣ STEP 4: Tạo response cho frontend
    // ⚠️ QUAN TRỌNG: Return user info KHÔNG return tokens (tokens ở cookies)
    const res = NextResponse.json(
      {
        // Frontend sẽ lấy data này để lưu vào localStorage
        user: {
          id: data.id,
          email: data.email,
          userName: data.username,  // ✅ Normalize: username → userName (match AuthUser type)
          roles: data.roles,
          avatar: data.avatar,
        },
      },
      { status: 200 }
    )

    // 8️⃣ STEP 5: SET HTTP-ONLY COOKIES (SERVER-SIDE) - 🔒 BẢO MẬT NHẤT
    // ✅ Tokens được set ở SERVER, JavaScript không bao giờ access được
    // ✅ Browser tự động gửi cookies khi call API (credentials: 'include')
    // ✅ Bảo mật từ XSS attack (JS không thể đọc HTTP-only cookies)
    
    // AccessToken: Set 1 hour
    res.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,        // 🔒 QUAN TRỌNG: JS không thể truy cập (XSS safe)
      secure: false,         // 🔧 DEV: localhost HTTP không HTTPS, nên false
      sameSite: 'lax',       // 🔒 CSRF protection
      maxAge: 3600,          // 1 hour
      path: '/',
    })

    // RefreshToken: Set 7 days (nếu backend trả về)
    if (data.refreshToken) {
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,      // 🔒 JS không thể truy cập
        secure: false,       // 🔧 DEV: localhost HTTP không HTTPS, nên false
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600, // 7 days
        path: '/',
      })
    }

    // 9️⃣ STEP 6: Tóm tắt
    // Frontend nhận: { user: {...} } → lưu vào localStorage
    // Browser tự động nhớ: accessToken + refreshToken ở cookies
    // Lần follow-up request: Browser tự động gửi cookies (còn frontend không biết)
    console.log(`✅ [login] HTTP-only cookies set, returning user info`)
    return res
  } catch (error: any) {
    // ❌ Nếu có lỗi gì (network, JSON parse, etc.)
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed: ' + error.message },
      { status: 500 }
    )
  }
}
