"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCartQuery } from "@/hooks/useCartQuery";
import { useAuth } from "@/hooks/useAuth";
import { CartService } from "@/service/CartService";
import { ProductHeader } from "@/app/components/layout/product-header";
import { Footer } from "@/app/components/layout/footer";
import { CartItem } from "./CartItem";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items, loading: cartLoading, refetch } = useCartQuery(isAuthenticated);
  const loading = authLoading || (isAuthenticated && cartLoading);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // ✅ Logic 1: Xử lý cập nhật số lượng
  const onUpdateQuantity = async (id: number, qty: number) => {
    await CartService.updateCartItemQuantity(id, qty);
    await refetch();
  };

  // ✅ Logic 2: Xử lý xóa sản phẩm khỏi giỏ
  const onDeleteItem = async (id: number) => {
    try {
      await CartService.removeCartItem(id);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      await refetch();
      // Xóa luôn khỏi danh sách đang chọn nếu có
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  // ✅ Logic 3: Chuyển sang thanh toán (QUAN TRỌNG - SỬA LỖI Ở ĐÂY)
  const handleCheckout = () => {
    if (selectedItems.size === 0) return;

    // Chuyển Set thành Array và mã hóa thành chuỗi JSON để truyền qua URL
    const selectedIds = Array.from(selectedItems);
    const queryParams = new URLSearchParams({
      selected: JSON.stringify(selectedIds)
    });

    router.push(`/checkout?${queryParams.toString()}`);
  };

  // Tính tổng tiền cho những món được tick chọn
  const selectedTotal = useMemo(() => {
    return items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
  }, [items, selectedItems]);

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(items.map(i => i.id)));
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">Đang tải giỏ hàng...</div>;

  return (
    <main className="min-h-screen bg-[#fafafa] pb-40">
      <ProductHeader />
      <div className="max-w-7xl mx-auto px-4 pt-28">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-red-500 mb-8 font-bold hover:text-red-600 transition-colors">
          <ArrowLeft size={20} /> Quay lại
        </button>

        <h1 className="text-4xl font-black text-gray-900 mb-8 flex items-center gap-4">
          Giỏ hàng <span className="text-lg font-bold text-gray-400">({items.length})</span>
        </h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
             <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
             <p className="text-gray-800 font-bold text-xl mb-2">Bạn chưa đăng nhập</p>
             <p className="text-gray-400 text-sm mb-8">Vui lòng đăng nhập để xem các món ăn đã lưu trong giỏ hàng của bạn.</p>
             <button onClick={() => router.push('/login-page')} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-md shadow-red-200">Đăng nhập ngay</button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
             <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
             <p className="text-gray-500 font-bold text-xl mb-8">Giỏ hàng của bạn đang trống</p>
             <button onClick={() => router.push('/food')} className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold">Mua sắm ngay</button>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-12 p-6 bg-gray-50/50 border-b border-gray-100 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  checked={items.length > 0 && selectedItems.size === items.length} 
                  onChange={toggleSelectAll} 
                  className="w-5 h-5 accent-red-500 cursor-pointer" 
                />
              </div>
              <div className="col-span-4">Sản phẩm</div>
              <div className="col-span-2 text-center">Giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Tổng cộng</div>
              <div className="col-span-1"></div>
            </div>

            {items.map(item => (
              <CartItem 
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onToggle={(id: number) => {
                  setSelectedItems(prev => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
                onUpdate={onUpdateQuantity}
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thanh thanh toán Footer cố định */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-tight">Tổng thanh toán ({selectedItems.size} món)</span>
                <span className="text-3xl font-black text-red-500">
                  ${(selectedTotal / 1000).toFixed(1)}
                </span>
             </div>
             <button 
               onClick={handleCheckout}
               disabled={selectedItems.size === 0}
               className="bg-red-500 hover:bg-red-600 disabled:bg-gray-200 text-white px-12 py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-red-200"
             >
               Tiến hành thanh toán
             </button>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}
