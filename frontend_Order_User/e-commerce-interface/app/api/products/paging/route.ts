/**
 * API Route: /api/products/paging (GET)
 * ✅ Proxy cho backend GET /api/products/paging
 * ✅ PUBLIC - Không cần accessToken
 * ✅ Cho phép guest user xem sản phẩm
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function GET(req: NextRequest) {
  try {
    // Lấy query params từ request gốc
    const { searchParams } = new URL(req.url)
    const queryString = searchParams.toString()

    const backendUrl = `${API_URL}/products/paging${queryString ? `?${queryString}` : ''}`
    console.log(`🛒 [/api/products/paging GET] Calling backend: ${backendUrl}`)

    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({ message: backendRes.statusText }))
      console.error(`❌ [/api/products/paging GET] Backend error:`, errorData)
      return NextResponse.json(errorData, { status: backendRes.status })
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/products/paging GET] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to fetch products: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
