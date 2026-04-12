import { NextRequest, NextResponse } from 'next/server'

/**
 * 📋 API Route: /api/carts (GET)
 * ✅ Lấy thông tin giỏ hàng hiện tại của user
 * ✅ Tokens được lấy từ HTTP-Only cookies (server-side)
 * ✅ Forward request tới backend với Authorization header
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * GET /api/carts - Lấy giỏ hàng của user hiện tại
 */
export async function GET(req: NextRequest) {
  try {
    // 🔍 DEBUG: Log cookies
    const allCookies = req.cookies.getAll()
    console.log(`🔍 [/api/carts GET] Cookies:`, allCookies.map(c => c.name))

    // 1️⃣ Lấy accessToken từ HTTP-Only cookies (server-side)
    const accessToken = req.cookies.get('accessToken')?.value

    console.log(`🔍 [/api/carts GET] accessToken:`, accessToken ? '✅ có' : '❌ không có')

    if (!accessToken) {
      console.error('❌ [/api/carts GET] No accessToken')
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2️⃣ Forward tới backend với Authorization header
    console.log(`🚀 [/api/carts GET] Calling backend: ${API_URL}/carts`)

    const backendRes = await fetch(`${API_URL}/carts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`📡 [/api/carts GET] Backend response status: ${backendRes.status}`)

    // 3️⃣ Nếu backend trả lỗi
    if (!backendRes.ok) {
      let error: any = {}
      try {
        error = await backendRes.json()
      } catch {
        error = { message: backendRes.statusText }
      }
      console.error(`❌ [/api/carts GET] Backend error:`, error)
      return NextResponse.json(
        { message: error.message || 'Failed to get cart' },
        { status: backendRes.status }
      )
    }

    // 4️⃣ Backend trả thành công
    const cartData = await backendRes.json()
    console.log(`✅ [/api/carts GET] Get cart success:`, {
      cartId: cartData.id,
      userId: cartData.userId,
      totalPrice: cartData.totalPrice,
      itemCount: cartData.items?.length,
    })

    return NextResponse.json(cartData, { status: 200 })
  } catch (error: any) {
    console.error('❌ [/api/carts GET] Error:', error.message)
    return NextResponse.json(
      { message: 'Failed to get cart: ' + error.message },
      { status: 500 }
    )
  }
}
