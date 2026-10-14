import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/auth/forgot-password (POST)
 * ✅ Gửi OTP reset mật khẩu đến email
 * ✅ Không cần token (public endpoint)
 */

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/$/, '')}/api`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log(`🚀 [/api/auth/forgot-password POST] Calling backend: ${API_URL}/auth/forgot-password`)

    const backendRes = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    console.log(`📡 [/api/auth/forgot-password POST] Backend response status: ${backendRes.status}`)

    if (!backendRes.ok) {
      let errorData: unknown = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      return NextResponse.json(
        { message: (errorData as { message?: string }).message || 'Failed to send reset OTP' },
        { status: backendRes.status }
      )
    }

    const responseData = await backendRes.json()
    return NextResponse.json(responseData, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/auth/forgot-password POST] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to send reset OTP: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
