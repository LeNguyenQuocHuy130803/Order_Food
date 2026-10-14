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
  } catch (error: unknown) {
    console.error('❌ [GET /api/users] Exception:', (error as Error).message)
    return NextResponse.json(
      { message: (error as Error).message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const userId = id
    console.log(`🔍 [PATCH /api/users/${userId}] Proxying update request...`)

    const token = request.cookies.get('accessToken')?.value
    
    if (!token) {
      console.error('❌ [PATCH /api/users] No token found in cookies')
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Forward the headers, especially Content-Type which includes the multipart boundary
    const headers = new Headers()
    headers.set('Authorization', `Bearer ${token}`)
    
    const contentType = request.headers.get('content-type')
    if (contentType) {
      headers.set('Content-Type', contentType)
    }

    // Proxy the request body stream directly
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: headers,
      body: request.body,
      // @ts-expect-error Node's fetch supports duplex while RequestInit does not include it yet.
      duplex: 'half'
    })

    console.log(`📡 [PATCH /api/users/${userId}] Backend response status: ${response.status}`)

    if (!response.ok) {
      const error = await response.json()
      console.error(`❌ [PATCH /api/users/${userId}] Error:`, error)
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    console.log(`✅ [PATCH /api/users/${userId}] User updated successfully`)
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('❌ [PATCH /api/users] Exception:', (error as Error).message)
    return NextResponse.json(
      { message: (error as Error).message || 'Internal server error' },
      { status: 500 }
    )
  }
}
