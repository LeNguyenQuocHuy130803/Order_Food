import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/orders/[id] (GET)
 * ✅ Lấy chi tiết đơn hàng của user
 * ✅ Tokens được lấy từ HTTP-Only cookies (server-side)
 * ✅ Forward request tới backend với Authorization header
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const backendUrl = `${API_URL}/orders/${id}`

    console.log(`🚀 [/api/orders/[id] GET] Calling backend: ${backendUrl}`)

    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`📡 [/api/orders/[id] GET] Backend response status: ${backendRes.status}`)

    if (!backendRes.ok) {
      let errorData: unknown = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      return NextResponse.json(
        { message: (errorData as { message?: string }).message || 'Failed to get order detail' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/orders/[id] GET] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to get order detail: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * ❌ API Route: /api/orders/[id] (DELETE)
 * ✅ Hủy đơn hàng & hoàn kho tức thì
 * ✅ Proxy DELETE request tới backend DELETE /api/orders/{id}
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const backendUrl = `${API_URL}/orders/${id}`

    console.log(`🚀 [/api/orders/[id] DELETE] Calling backend: ${backendUrl}`)

    const backendRes = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`📡 [/api/orders/[id] DELETE] Backend response status: ${backendRes.status}`)

    if (!backendRes.ok) {
      let errorData: unknown = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      return NextResponse.json(
        { message: (errorData as { message?: string }).message || 'Failed to cancel order' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ [/api/orders/[id] DELETE] Error:', (error as Error).message)
    return NextResponse.json(
      { message: 'Failed to cancel order: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
