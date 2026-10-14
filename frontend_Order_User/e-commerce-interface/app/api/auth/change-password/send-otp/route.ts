import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/auth/change-password/send-otp (POST)
 * ✅ Gửi OTP đến email user để xác nhận đổi mật khẩu
 * ✅ Tokens được lấy từ HTTP-Only cookies (server-side)
 * ✅ Forward request tới backend với Authorization header
 */

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/$/, '')}/api`

/**
 * POST /api/auth/change-password/send-otp - Gửi OTP đổi mật khẩu
 */
export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Lấy accessToken từ HTTP-Only cookies (server-side)
    const accessToken = req.cookies.get('accessToken')?.value

    console.log(`🔍 [/api/auth/change-password/send-otp POST] accessToken:`, accessToken ? '✅ có' : '❌ không có')

    if (!accessToken) {
      console.error('❌ [/api/auth/change-password/send-otp POST] No accessToken')
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2️⃣ Forward tới backend với Authorization header
    console.log(`🚀 [/api/auth/change-password/send-otp POST] Calling backend: ${API_URL}/auth/change-password/send-otp`)

    const backendRes = await fetch(`${API_URL}/auth/change-password/send-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`📡 [/api/auth/change-password/send-otp POST] Backend response status: ${backendRes.status}`)

    // 3️⃣ Nếu backend trả lỗi
    if (!backendRes.ok) {
      let errorData: unknown = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      console.error(`❌ [/api/auth/change-password/send-otp POST] Backend error:`, errorData)
      return NextResponse.json(
        { message: (errorData as { message?: string }).message || 'Failed to send OTP' },
        { status: backendRes.status }
      )
    }

    // 4️⃣ Backend trả thành công
    const responseData = await backendRes.json()
    console.log(`✅ [/api/auth/change-password/send-otp POST] OTP sent successfully`)

    return NextResponse.json(responseData, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/auth/change-password/send-otp POST] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to send OTP: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
