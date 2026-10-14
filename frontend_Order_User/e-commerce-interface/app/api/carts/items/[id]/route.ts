import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      console.error('❌ [PATCH /api/carts/items/[id]] No accessToken in cookies')
      return NextResponse.json(
        { message: 'Unauthorized - No token. Please login first' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const quantity = body.quantity

    if (quantity === undefined || quantity === null || quantity <= 0) {
      return NextResponse.json(
        { message: 'Quantity must be a positive integer' },
        { status: 400 }
      )
    }

    console.log(`🚀 [PATCH /api/carts/items/[id]] Calling backend: ${API_URL}/carts/items/${id}`, { quantity })

    const backendRes = await fetch(`${API_URL}/carts/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    })

    console.log(`📡 [PATCH /api/carts/items/[id]] Backend response status: ${backendRes.status}`)

    if (!backendRes.ok) {
      let errorData: { message?: string } = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      console.error(`❌ [PATCH /api/carts/items/[id]] Backend error:`, errorData)
      return NextResponse.json(
        { message: errorData.message || 'Failed to update cart item quantity' },
        { status: backendRes.status }
      )
    }

    const cartData = await backendRes.json()
    return NextResponse.json(cartData, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ [PATCH /api/carts/items/[id]] Error:', message)
    return NextResponse.json(
      { message: 'Failed to update cart item: ' + message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      console.error('❌ [DELETE /api/carts/items/[id]] No accessToken in cookies')
      return NextResponse.json(
        { message: 'Unauthorized - No token. Please login first' },
        { status: 401 }
      )
    }

    console.log(`🚀 [DELETE /api/carts/items/[id]] Calling backend: ${API_URL}/carts/items/${id}`)

    const backendRes = await fetch(`${API_URL}/carts/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`📡 [DELETE /api/carts/items/[id]] Backend response status: ${backendRes.status}`)

    if (!backendRes.ok) {
      let errorData: { message?: string } = {}
      try {
        errorData = await backendRes.json()
      } catch {
        errorData = { message: backendRes.statusText }
      }
      console.error(`❌ [DELETE /api/carts/items/[id]] Backend error:`, errorData)
      return NextResponse.json(
        { message: errorData.message || 'Failed to delete cart item' },
        { status: backendRes.status }
      )
    }

    const cartData = await backendRes.json()
    console.log(`✅ [DELETE /api/carts/items/[id]] Delete success, updated cart:`, {
      cartId: cartData.id,
      totalPrice: cartData.totalPrice,
      itemCount: cartData.items?.length,
    })

    return NextResponse.json(cartData, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ [DELETE /api/carts/items/[id]] Error:', message)
    return NextResponse.json(
      { message: 'Failed to delete cart item: ' + message },
      { status: 500 }
    )
  }
}
