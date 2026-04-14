/**
 * GET /api/users/[id]
 * Gọi backend để lấy chi tiết user bằng ID
 * Token sẽ được gửi tự động từ HTTP-Only cookies
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ params là Promise ở Next.js 13+, cần await
    const { id } = await props.params
    const userId = id
    console.log(`🔍 [GET /api/users/${userId}] Fetching user detail...`)

    // ✅ Lấy token từ cookies
    const token = request.cookies.get('accessToken')?.value
    
    if (!token) {
      console.error('❌ [GET /api/users] No token found in cookies')
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // ✅ Gọi backend API với token
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    console.log(`📡 [GET /api/users/${userId}] Backend response status: ${response.status}`)

    if (!response.ok) {
      const error = await response.json()
      console.error(`❌ [GET /api/users/${userId}] Error:`, error)
      return NextResponse.json(error, { status: response.status })
    }

    // ✅ Trả về user detail
    const data = await response.json()
    console.log(`✅ [GET /api/users/${userId}] User detail fetched:`, {
      id: data.id,
      email: data.email,
      userName: data.userName,
      phoneNumber: data.phoneNumber,
      addresses: data.addresses?.length || 0,
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ [GET /api/users] Exception:', error.message)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
