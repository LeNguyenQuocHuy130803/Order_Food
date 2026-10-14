import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/auth/change-password (PATCH)
 * ✅ Đổi mật khẩu cho user hiện tại
 * ✅ Tokens được lấy từ HTTP-Only cookies (server-side)
 * ✅ Forward request tới backend với Authorization header
 */

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/$/, '')}/api`

/**
 * PATCH /api/auth/change-password - Đổi mật khẩu
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1️⃣ Lấy body (oldPassword, newPassword)
    const body = await req.json()

    // 2️⃣ Lấy accessToken từ HTTP-Only cookies (server-side)
    const accessToken = req.cookies.get('accessToken')?.value

    console.log(`🔍 [/api/auth/change-password PATCH] accessToken:`, accessToken ? '✅ có' : '❌ không có')

    if (!accessToken) {
      console.error('❌ [/api/auth/change-password PATCH] No accessToken')
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 3️⃣ Forward tới backend với Authorization header
    console.log(`🚀 [/api/auth/change-password PATCH] Calling backend: ${API_URL}/auth/change-password`)

    const backendRes = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log(`📡 [/api/auth/change-password PATCH] Backend response status: ${backendRes.status}`)

    // 4️⃣ Nếu backend trả lỗi
    if (!backendRes.ok) {
      let errorData: unknown = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      console.error(`❌ [/api/auth/change-password PATCH] Backend error:`, errorData)
      return NextResponse.json(
        { message: (errorData as Error).message || 'Failed to change password' },
        { status: backendRes.status }
      )
    }

    // 5️⃣ Backend trả thành công
    const responseData = await backendRes.json()
    console.log(`✅ [/api/auth/change-password PATCH] Change password success`)

    return NextResponse.json(responseData, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/auth/change-password PATCH] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to change password: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
