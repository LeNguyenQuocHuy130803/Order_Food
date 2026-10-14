/**
 * API Route: /api/products (GET)
 * ✅ Proxy cho backend GET /api/products (filter products)
 * ✅ PUBLIC - Không cần accessToken
 * ✅ Cho phép guest user tìm kiếm/lọc sản phẩm
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const queryString = searchParams.toString()

    const backendUrl = `${API_URL}/products${queryString ? `?${queryString}` : ''}`
    console.log(`🔍 [/api/products GET] Calling backend: ${backendUrl}`)

    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({ message: backendRes.statusText }))
      console.error(`❌ [/api/products GET] Backend error:`, errorData)
      return NextResponse.json(errorData, { status: backendRes.status })
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/products GET] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to fetch products: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
