import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/auth/reset-password (POST)
 * ✅ Đặt lại mật khẩu bằng OTP
 * ✅ Không cần token (public endpoint)
 */

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/$/, '')}/api`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log(`🚀 [/api/auth/reset-password POST] Calling backend: ${API_URL}/auth/reset-password`)

    const backendRes = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    console.log(`📡 [/api/auth/reset-password POST] Backend response status: ${backendRes.status}`)

    if (!backendRes.ok) {
      let errorData: unknown = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      return NextResponse.json(
        { message: (errorData as { message?: string }).message || 'Failed to reset password' },
        { status: backendRes.status }
      )
    }

    const responseData = await backendRes.json()
    return NextResponse.json(responseData, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/auth/reset-password POST] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to reset password: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
