export interface PaymentRequestDto {
  orderId: number
  returnUrl?: string
  cancelUrl?: string
}

export interface CreatePaymentResponse {
  success: boolean
  paypalOrderId: string
  approveUrl: string
  amountVND: number
  amountUSD: number
  orderId: number
}

export interface CapturePaymentResponse {
  success: boolean
  paypalStatus: string
  orderId: number
  paypalOrderId: string
  message: string
  timestamp: string
}

export interface PaymentHistoryDto {
  id: number
  txnRef: string
  amount: number
  status: string // PENDING, SUCCESS, FAILED
  statusVN: string // CHỜ XỬ LÝ, THÀNH CÔNG, THẤT BẠI
  amountFormatted: string
  provider: string // PAYPAL
  responseCode: string
  orderInfo: string
  paypalOrderId?: string
  payerId?: string
  captureId?: string
  createdAt: string
  updatedAt: string
}

export interface OrderCheckoutResponse {
  id: number
  status: string
  totalPrice: number
  createdAt: string
}

export interface CheckoutOrderRequest {
  addressType?: string
  address?: string
  notes?: string
  cartItemIds?: number[]
}
