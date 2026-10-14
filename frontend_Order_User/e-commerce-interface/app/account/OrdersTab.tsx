'use client'

import React, { useState, useMemo } from 'react'
import { 
  ShoppingBag, Package, Truck, Home, CheckCircle, 
  XCircle, RotateCcw, RefreshCcw, ChevronRight
} from 'lucide-react'
import { useOrdersQuery } from '@/hooks/useOrdersQuery'
import { motion, AnimatePresence } from 'framer-motion'

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled' | 'returning'

interface OrderStatusConfig {
  id: OrderStatus
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  backendStatus?: string
}

const ORDER_STATUSES: OrderStatusConfig[] = [
  { id: 'all', label: 'Tất Cả', icon: ShoppingBag, color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
  { id: 'pending', label: 'Chờ Thanh Toán', icon: Package, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', backendStatus: 'PENDING' },
  { id: 'processing', label: 'Vận Chuyển', icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', backendStatus: 'PROCESSING' },
  { id: 'shipping', label: 'Chờ Giao Hàng', icon: Home, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', backendStatus: 'SHIPPING' },
  { id: 'completed', label: 'Hoàn Thành', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', backendStatus: 'COMPLETED' },
  { id: 'cancelled', label: 'Đã Hủy', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', backendStatus: 'CANCELLED' },
  { id: 'returning', label: 'Trả Hàng', icon: RotateCcw, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', backendStatus: 'RETURNING' },
]

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

export function OrdersTab() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all')
  const { data: orders = [], isLoading, error, refetch } = useOrdersQuery()

  // Lọc đơn hàng mượt mà
  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'all') return orders
    const targetStatus = ORDER_STATUSES.find(s => s.id === selectedStatus)?.backendStatus
    return orders.filter(o => o.status.toUpperCase() === targetStatus?.toUpperCase())
  }, [orders, selectedStatus])

  return (
    <div className="w-full space-y-6">
      {/* Tab Navigation với hiệu ứng motion */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {ORDER_STATUSES.map((status) => {
            const Icon = status.icon
            const isActive = selectedStatus === status.id
            return (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest active:scale-95 ${
                  isActive ? `${status.bgColor} ${status.color} shadow-sm` : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                {status.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <RefreshCcw className="animate-spin text-[#ff5528] mb-4" size={32} />
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-bold mb-4">⚠️ {error.message || 'Hệ thống API đang gặp sự cố (HTML thay vì JSON)'}</p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all"
          >
            Thử lại ngay
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="grid gap-4">
        <AnimatePresence mode='popLayout'>
          {!isLoading && !error && filteredOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100"
            >
              <ShoppingBag size={64} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">Không có đơn hàng nào trong mục này</p>
            </motion.div>
          ) : (
            filteredOrders.map((order) => {
              const statusCfg = ORDER_STATUSES.find(s => s.backendStatus === order.status.toUpperCase()) || ORDER_STATUSES[0];
              const StatusIcon = statusCfg.icon;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={order.id}
                  className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${statusCfg.bgColor} ${statusCfg.color}`}>
                        <StatusIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn hàng</p>
                        <p className="font-black text-[#0d0d0d]">#{order.id.toString().padStart(6, '0')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày đặt</p>
                      <p className="font-bold text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Items - Rút gọn */}
                  <div className="space-y-4 mb-6">
                    {order.items.slice(0, 3).map((item, idx) => {
                      const itemPrice = item.priceAtTime ?? item.price ?? 0
                      const itemImage = item.imageUrl ?? item.image
                      return (
                        <div key={idx} className="flex items-center justify-between group/item">
                          <div className="flex items-center gap-3">
                            {itemImage ? (
                              <img
                                src={itemImage}
                                alt={item.productName}
                                className="w-12 h-12 bg-gray-50 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 text-xs">
                                {item.quantity}x
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-800 text-sm group-hover/item:text-[#ff5528] transition-colors">{item.productName}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                {item.quantity}x • {formatPrice(itemPrice)}
                              </p>
                            </div>
                          </div>
                          <p className="font-black text-gray-700 text-sm">{formatPrice(itemPrice * item.quantity)}</p>
                        </div>
                      )
                    })}
                    {order.items.length > 3 && (
                      <p className="text-[10px] font-black text-[#ff5528] uppercase tracking-widest pl-1">
                        + và {order.items.length - 3} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng thanh toán</p>
                      <p className="text-2xl font-black text-[#ff5528] tracking-tighter">{formatPrice(order.totalPrice)}</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#0d0d0d] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#ff5528] transition-all shadow-lg active:scale-95">
                      Xem chi tiết <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
