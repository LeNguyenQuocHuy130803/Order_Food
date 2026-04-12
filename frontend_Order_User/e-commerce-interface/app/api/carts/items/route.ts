import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/carts/items
 * 
 * FLOW:
 * Frontend (product-card)
 *   ↓ POST /api/carts/items { productType, productId, quantity }
 *   ↓
 * Route này (proxy server)
 *   ↓ Lấy accessToken từ cookies (server-side)
 *   ↓ Forward tới backend Spring Boot với Authorization header
 *   ↓
 * Backend trả về cart data
 *   ↓
 * Route này return cart data cho frontend
 * 
 * ✅ Token luôn ở server-side (không lộ cho JS)
 * ✅ Backend URL che giấu
 * ✅ CORS tự động giải quyết (same-origin)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * POST /api/carts/items - Thêm sản phẩm vào giỏ hàng
 */
export async function POST(req: NextRequest) {
  try {
    // 🔍 DEBUG: Log tất cả cookies
    const allCookies = req.cookies.getAll()
    console.log(`🔍 [DEBUG] All cookies:`, allCookies.map(c => c.name))

    // 1️⃣ Lấy accessToken từ HTTP-Only cookies (server-side)
    const accessToken = req.cookies.get('accessToken')?.value

    console.log(`🔍 [DEBUG] accessToken:`, accessToken ? '✅ có' : '❌ không có')

    if (!accessToken) {
      console.error('❌ [/api/carts/items] No accessToken in cookies')
      console.error('❌ Người dùng chưa login hoặc token hết hạn')
      return NextResponse.json(
        { message: 'Unauthorized - No token. Please login first' },
        { status: 401 }
      )
    }

    // 2️⃣ Parse request body
    const body = await req.json()
    console.log(`🛒 [/api/carts/items] POST request:`, {
      productType: body.productType,
      productId: body.productId,
      quantity: body.quantity,
    })

    // 3️⃣ Forward tới backend với Authorization header
    console.log(`🚀 [/api/carts/items] Calling backend: ${API_URL}/carts/items`)

    const backendRes = await fetch(`${API_URL}/carts/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,  // ✅ Gửi token từ server
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productType: body.productType,
        productId: body.productId,
        quantity: body.quantity,
      }),
    })

    console.log(`📡 [/api/carts/items] Backend response status: ${backendRes.status}`)

    // 4️⃣ Nếu backend trả lỗi
    if (!backendRes.ok) {
      let error: any = {}
      try {
        error = await backendRes.json()
      } catch {
        error = { message: backendRes.statusText }
      }
      console.error(`❌ [/api/carts/items] Backend error:`, error)
      return NextResponse.json(
        { message: error.message || 'Failed to add to cart' },
        { status: backendRes.status }
      )
    }

    // 5️⃣ Backend trả thành công
    const cartData = await backendRes.json()
    console.log(`✅ [/api/carts/items] Add to cart success:`, {
      cartId: cartData.id,
      userId: cartData.userId,
      totalPrice: cartData.totalPrice,
      itemCount: cartData.items?.length,
    })

    return NextResponse.json(cartData, { status: 200 })
  } catch (error: any) {
    console.error('❌ [/api/carts/items] Error:', error.message)
    return NextResponse.json(
      { message: 'Failed to add to cart: ' + error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/carts/items/{cartItemId}?quantity=N - Cập nhật số lượng sản phẩm trong giỏ hàng
 * ✅ Dùng query param để lấy quantity
 * ✅ Dùng body || dynamic route để lấy cartItemId (hoặc từ URL)
 */
export async function PATCH(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      console.error('❌ [/api/carts/items] PATCH No accessToken')
      return NextResponse.json(
        { message: 'Unauthorized - No token. Please login first' },
        { status: 401 }
      )
    }

    // 1️⃣ Lấy quantity từ query params
    const { searchParams } = new URL(req.url)
    const cartItemId = searchParams.get('cartItemId')
    const quantity = searchParams.get('quantity')

    console.log(`🛒 [/api/carts/items] PATCH request:`, {
      cartItemId,
      quantity,
    })

    if (!cartItemId || !quantity) {
      return NextResponse.json(
        { message: 'Missing cartItemId or quantity parameter' },
        { status: 400 }
      )
    }

    // 2️⃣ Forward tới backend: PATCH /carts/items/{cartItemId}?quantity={quantity}
    console.log(`🚀 [/api/carts/items] Calling backend: ${API_URL}/carts/items/${cartItemId}?quantity=${quantity}`)

    const backendRes = await fetch(
      `${API_URL}/carts/items/${cartItemId}?quantity=${quantity}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(`📡 [/api/carts/items] PATCH Backend response status: ${backendRes.status}`)

    // 3️⃣ Nếu backend trả lỗi
    if (!backendRes.ok) {
      let error: any = {}
      try {
        error = await backendRes.json()
      } catch {
        error = { message: backendRes.statusText }
      }
      console.error(`❌ [/api/carts/items] PATCH Backend error:`, error)
      return NextResponse.json(
        { message: error.message || 'Failed to update cart item quantity' },
        { status: backendRes.status }
      )
    }

    // 4️⃣ Backend trả thành công
    const cartData = await backendRes.json()
    console.log(`✅ [/api/carts/items] Update quantity success:`, {
      cartId: cartData.id,
      totalPrice: cartData.totalPrice,
      itemCount: cartData.items?.length,
    })

    return NextResponse.json(cartData, { status: 200 })
  } catch (error: any) {
    console.error('❌ [/api/carts/items] PATCH Error:', error.message)
    return NextResponse.json(
      { message: 'Failed to update quantity: ' + error.message },
      { status: 500 }
    )
  }
}
