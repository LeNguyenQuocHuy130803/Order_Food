// tăng giảm số lượng mua hàng xử lí việc thêm giảm ở giỏ 
"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { CartItem as CartItemData } from "@/types/cart";

interface CartItemProps {
  item: CartItemData;
  isSelected: boolean;
  onToggle: (id: number) => void;
  onUpdate: (id: number, quantity: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function CartItem({ item, isSelected, onToggle, onUpdate, onDelete }: CartItemProps) {
  const [localQty, setLocalQty] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  // Hàm debounce để tránh gọi API liên tục khi nhấn nút nhanh
  const debouncedUpdate = useDebounce(async (newQty: number) => {
    setIsUpdating(true);
    setError("");
    try {
      await onUpdate(item.id, newQty);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
      setLocalQty(item.quantity); // Revert nếu lỗi
    } finally {
      setIsUpdating(false);
    }
  }, 1000);

  const handleQtyChange = (diff: number) => {
    const next = localQty + diff;
    if (next < 1) return;
    setLocalQty(next);
    debouncedUpdate(next);
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-center p-6 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <input 
        type="checkbox" 
        checked={isSelected} 
        onChange={() => onToggle(item.id)}
        className="col-span-1 w-5 h-5 accent-red-500 cursor-pointer" 
      />
      
      <div className="col-span-4 flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
          <Image src={item.imageUrl || "/image/avatarNull/avatarNull.jpg"} alt={item.productName} fill className="object-cover" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.productName}</h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">SKU: {item.id}</span>
        </div>
      </div>

      <div className="col-span-2 text-center font-medium text-gray-500 text-sm">
        ${(item.priceAtTime / 1000).toFixed(1)}
      </div>

      <div className="col-span-2 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => handleQtyChange(-1)} 
            disabled={isUpdating || localQty <= 1} 
            className="p-1.5 hover:bg-gray-50 rounded-lg disabled:opacity-20"
          >
            <Minus size={14}/>
          </button>
          <span className="w-8 text-center font-black text-sm">{localQty}</span>
          <button 
            onClick={() => handleQtyChange(1)} 
            disabled={isUpdating} 
            className="p-1.5 hover:bg-gray-50 rounded-lg disabled:opacity-20"
          >
            <Plus size={14}/>
          </button>
        </div>
        {isUpdating && <Loader2 size={12} className="animate-spin text-blue-500" />}
        {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
      </div>

      <div className="col-span-2 text-right font-black text-red-500">
        ${((item.priceAtTime * localQty) / 1000).toFixed(1)}
      </div>

      <div className="col-span-1 flex justify-center">
        <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
