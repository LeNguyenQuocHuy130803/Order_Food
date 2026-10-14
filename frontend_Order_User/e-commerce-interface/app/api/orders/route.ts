import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/orders (GET)
 * ✅ Lấy danh sách đơn hàng của user với phân trang
 * ✅ Tokens được lấy từ HTTP-Only cookies (server-side)
 * ✅ Forward request tới backend /orders/paging
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || '1'
    const size = searchParams.get('size') || '50'
    const status = searchParams.get('status')
    
    // Backend Spring Boot endpoint: GET /api/orders/paging?page={page}&size={size}
    let backendUrl = `${API_URL}/orders/paging?page=${page}&size=${size}`
    if (status && status !== 'ALL') {
      backendUrl += `&status=${encodeURIComponent(status)}`
    }

    console.log(`🚀 [/api/orders GET] Calling backend: ${backendUrl}`)

    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`📡 [/api/orders GET] Backend response status: ${backendRes.status}`)

    if (!backendRes.ok) {
      let errorData: unknown = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      return NextResponse.json(
        { message: (errorData as { message?: string }).message || 'Failed to get orders' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/orders GET] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to get orders: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
