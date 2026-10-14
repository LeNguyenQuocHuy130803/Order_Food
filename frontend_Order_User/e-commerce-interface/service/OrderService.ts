/**
 * 🛒 Order Service
 * Xử lý tạo đơn hàng, thanh toán
 */

import { apiFetch } from '@/lib/api/api-client-refresh'
import { CreateOrderRequest, CreateOrderResponse, Order, GetOrdersResponse } from '@/types/order'

/**
 * 📦 Tạo đơn hàng
 * POST /api/orders/checkout
 */
async function createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    console.log(`📦 [OrderService] Creating order...`, request)

    const res = await apiFetch('/api/orders/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Failed to create order')
    }

    const order = (await res.json()) as CreateOrderResponse

    console.log(`✅ [OrderService] Order created:`, {
      orderId: order.id,
      status: order.status,
      totalPrice: order.totalPrice,
    })

    return order
  } catch (error: unknown) {
    const errorMsg = (error as Error).message || 'Failed to create order'
    console.error(`❌ [OrderService] Create order failed:`, errorMsg)
    throw new Error(errorMsg)
  }
}

/**
 * 📋 Lấy danh sách đơn hàng của người dùng
 * GET /api/orders?page={page}&size={size}
 */
async function getOrders(status?: string, page: number = 1, size: number = 50): Promise<Order[]> {
  try {
    console.log(`📋 [OrderService] Fetching orders...`, { status, page, size })

    let url = `/api/orders?page=${page}&size=${size}`
    if (status && status !== 'ALL') {
      url += `&status=${encodeURIComponent(status)}`
    }

    const res = await apiFetch(url, {
      method: 'GET',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch orders')
    }

    const response = (await res.json()) as GetOrdersResponse

    console.log(`✅ [OrderService] Orders fetched:`, {
      total: response.totalRecords ?? response.total,
      count: response.data?.length,
    })

    return response.data || []
  } catch (error: unknown) {
    const errorMsg = (error as Error).message || 'Failed to fetch orders'
    console.error(`❌ [OrderService] Fetch orders failed:`, errorMsg)
    throw new Error(errorMsg)
  }
}

/**
 * 📄 Lấy chi tiết một đơn hàng
 * GET /api/orders/:id
 */
async function getOrderDetail(orderId: number): Promise<Order> {
  try {
    console.log(`📄 [OrderService] Fetching order detail:`, orderId)

    const res = await apiFetch(`/api/orders/${orderId}`, {
      method: 'GET',
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Failed to fetch order')
    }

    const order = (await res.json()) as Order

    console.log(`✅ [OrderService] Order detail fetched:`, {
      orderId: order.id,
      status: order.status,
    })

    return order
  } catch (error: unknown) {
    const errorMsg = (error as Error).message || 'Failed to fetch order'
    console.error(`❌ [OrderService] Fetch order detail failed:`, errorMsg)
    throw new Error(errorMsg)
  }
}

/**
 * ❌ Hủy đơn hàng & hoàn kho tức thì
 * DELETE /api/orders/:id
 * Gọi khi user cancel thanh toán PayPal hoặc tự hủy đơn
 */
async function cancelOrder(orderId: number): Promise<Order> {
  try {
    console.log(`❌ [OrderService] Cancelling order & restoring stock:`, orderId)

    const res = await apiFetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Failed to cancel order')
    }

    const order = (await res.json()) as Order

    console.log(`✅ [OrderService] Order cancelled & stock restored:`, {
      orderId: order.id,
      status: order.status,
    })

    return order
  } catch (error: unknown) {
    const errorMsg = (error as Error).message || 'Failed to cancel order'
    console.error(`❌ [OrderService] Cancel order failed:`, errorMsg)
    throw new Error(errorMsg)
  }
}

export const OrderService = {
  createOrder,
  getOrders,
  getOrderDetail,
  cancelOrder,
}
