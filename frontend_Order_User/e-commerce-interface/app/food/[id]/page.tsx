"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ArrowLeft, ShoppingCart, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Product } from "@/service/ProductService";
import { ProductService } from "@/service/ProductService";
import { CartService } from "@/service/CartService";
import { ProductHeader } from "@/app/components/layout/product-header";
import { Footer } from "@/app/components/layout/footer";
import { CART_QUERY_KEY } from "@/hooks/useCartQuery";
import { PRODUCT_TYPES } from "@/types/cart";

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const foodId = Number(params.id);
  const isValidFoodId = !isNaN(foodId) && foodId > 0;

  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: food, isLoading, error } = useQuery<Product, Error>({
    queryKey: ["food", foodId],
    queryFn: () => ProductService.getProductById(foodId),
    enabled: isValidFoodId,
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, selectedQuantity }: { productId: number; selectedQuantity: number }) => 
      CartService.addProductToCart(PRODUCT_TYPES.FOOD, productId, selectedQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success(`Đã thêm ${food?.name} vào giỏ hàng`);
      setQuantity(1);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Không thể thêm vào giỏ hàng");
    },
  });

  const totalPrice = useMemo(() => (food?.price || 0) * quantity, [food?.price, quantity]);
  const isAddingToCart = addToCartMutation.isPending;

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#ff5528]" size={40} /></div>;

  if (!isValidFoodId || error || !food) return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-lg font-bold text-red-500">❌ Sản phẩm không tồn tại</p>
      <button onClick={() => router.back()} className="bg-[#ff5528] text-white px-6 py-2 rounded-xl font-bold">Quay lại</button>
    </div>
  );

  return (
    <main className="bg-white min-h-screen">
      <ProductHeader />
      
      {/* max-w-6xl để thu hẹp chiều ngang tổng thể */}
      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-16 pt-28">
        
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#ff5528] transition-colors mb-8 font-bold group text-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại cửa hàng</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* TRÁI: Ảnh sản phẩm - Giới hạn max-width để không bị to quá */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="lg:sticky lg:top-32 flex justify-center"
          >
            <div className="relative aspect-square w-full max-w-[480px] rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-50 group">
              <Image
                src={food.imageUrl || "/image/placeholder.jpg"}
                alt={food.name}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="absolute top-6 right-6 bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg active:scale-75 transition-all"
              >
                <Heart size={22} className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"} />
              </button>
            </div>
          </motion.div>

          {/* PHẢI: Nội dung - Giảm size chữ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <span className="px-3 py-1 bg-orange-50 text-[#ff5528] rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                {food.category}
              </span>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tighter">
                {food.name}
              </h1>
              <p className="text-gray-500 text-base leading-relaxed font-medium max-w-md">
                {food.description}
              </p>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-gray-100 pb-10">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Giá niêm yết</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-[#ff5528]">
                      ${(food.price / 1000).toFixed(1)}
                    </span>
                    <span className="text-lg font-bold text-gray-300">/{food.unit}</span>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[11px] font-bold ${food.quantity > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {food.quantity > 0 ? `Còn ${food.quantity} sản phẩm` : "Hết hàng"}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="font-black text-gray-900 uppercase text-[11px] tracking-widest">Số lượng</span>
                <div className="flex items-center bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all shadow-sm active:scale-90"><Minus size={16}/></button>
                  <span className="w-14 text-center font-black text-xl">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(food.quantity, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all shadow-sm active:scale-90"><Plus size={16}/></button>
                </div>
              </div>

              {/* Khối Thanh Toán - Thu nhỏ padding và bo góc */}
              <div className="bg-gray-50 border-2 border-orange-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Tổng chi phí dự kiến</p>
                  <p className="text-4xl font-black text-[#ff5528]">${(totalPrice / 1000).toFixed(1)}</p>
                </div>
                <button
                  onClick={() => addToCartMutation.mutate({ productId: food.id, selectedQuantity: quantity })}
                  disabled={food.quantity === 0 || isAddingToCart}
                  className="bg-[#ff5528] hover:bg-orange-600 transition-all duration-300 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-orange-100"
                >
                  {isAddingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                  <span>{isAddingToCart ? "Đang xử lý..." : "Đặt món ngay"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}