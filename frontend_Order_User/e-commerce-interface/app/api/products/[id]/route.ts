/**
 * API Route: /api/products/[id] (GET)
 * ✅ Proxy cho backend GET /api/products/:id
 * ✅ PUBLIC - Không cần accessToken
 * ✅ Cho phép guest user xem chi tiết sản phẩm
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const backendUrl = `${API_URL}/products/${id}`
    console.log(`🔍 [/api/products/${id} GET] Calling backend: ${backendUrl}`)

    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({ message: backendRes.statusText }))
      console.error(`❌ [/api/products/${id} GET] Backend error:`, errorData)
      return NextResponse.json(errorData, { status: backendRes.status })
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/products/[id] GET] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to fetch product: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
