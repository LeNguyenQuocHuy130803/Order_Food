"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ArrowLeft, ShoppingCart, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion"; // Đảm bảo đã cài: npm install framer-motion
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Product } from "@/service/ProductService";
import { ProductService } from "@/service/ProductService";
import { CartService } from "@/service/CartService";
import { Header } from "@/app/components/layout/header";
import { Footer } from "@/app/components/layout/footer";
import { CART_QUERY_KEY } from "@/hooks/useCartQuery";
import { PRODUCT_TYPES } from "@/types/cart";

export default function DessertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Validate ID sản phẩm
  const dessertId = Number(params.id);
  const isValidId = !isNaN(dessertId) && dessertId > 0;

  // 2. Local State
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  // 3. Fetch dữ liệu Dessert với useQuery
  const {
    data: dessert,
    isLoading,
    error,
  } = useQuery<Product, Error>({
    queryKey: ["dessert", dessertId],
    queryFn: () => ProductService.getProductById(dessertId),
    enabled: isValidId,
  });

  // 4. Mutation xử lý thêm vào giỏ hàng
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, selectedQuantity }: { productId: number; selectedQuantity: number }) =>
      CartService.addProductToCart(PRODUCT_TYPES.DESSERT || "DESSERT", productId, selectedQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      
      toast.success("Đã thêm món tráng miệng vào giỏ hàng", {
        description: dessert?.name,
        action: {
          label: "Xem Giỏ Hàng",
          onClick: () => router.push("/cart"),
        },
      });
      setQuantity(1);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Lỗi khi thêm vào giỏ hàng");
    },
  });

  // 5. Tính toán tổng tiền
  const totalPrice = useMemo(() => {
    return (dessert?.price || 0) * quantity;
  }, [dessert?.price, quantity]);

  const isAddingToCart = addToCartMutation.isPending;

  // --- RENDERING LOGIC ---

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#ff5528]" />
      </div>
    );
  }

  if (!isValidId || error || !dessert) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 bg-white px-4">
        <p className="text-red-600 font-bold text-lg text-center">
          ❌ {!isValidId ? "ID không hợp lệ" : error?.message || "Không tìm thấy món tráng miệng này"}
        </p>
        <button
          onClick={() => router.back()}
          className="bg-[#ff5528] text-white px-8 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Nút Quay lại với Animation trượt từ trái */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-[#ff5528] transition-colors mb-8 font-bold group text-sm uppercase tracking-widest"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform duration-300" />
            <span>Back to Desserts</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* CỘT TRÁI: Ảnh sản phẩm (Sticky & Square) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:sticky lg:top-32 flex justify-center"
            >
              <div className="relative aspect-square w-full max-w-[480px] rounded-[3rem] overflow-hidden shadow-xl border border-gray-50 group">
                <Image
                  src={dessert.imageUrl || "/image/placeholder.jpg"}
                  alt={dessert.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                  priority
                />
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg active:scale-75 transition-all"
                >
                  <Heart
                    size={22}
                    className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
                  />
                </button>
              </div>
            </motion.div>

            {/* CỘT PHẢI: Nội dung chi tiết */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="mb-8">
                <span className="px-3 py-1 bg-orange-50 text-[#ff5528] rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block border border-orange-100">
                  {dessert.category}
                </span>
                <h1 className="text-4xl lg:text-6xl font-black text-[#0d0d0d] mb-4 tracking-tighter leading-tight">
                  {dessert.name}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">(128 reviews)</span>
                </div>
              </div>

              <p className="text-gray-500 leading-relaxed mb-10 text-base font-medium max-w-md">
                {dessert.description}
              </p>

              <div className="space-y-10">
                {/* Giá & Trạng thái */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-10">
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Price per unit</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-[#ff5528]">${dessert.price}</span>
                      <span className="text-lg font-bold text-gray-300">/ {dessert.unit}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[11px] font-bold ${dessert.quantity > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600'}`}>
                    {dessert.quantity > 0 ? `In Stock: ${dessert.quantity}` : 'Out of Stock'}
                  </div>
                </div>

                {/* Bộ chọn số lượng */}
                <div className="flex items-center gap-6">
                  <span className="text-[#0d0d0d] font-black uppercase text-[11px] tracking-widest">Quantity</span>
                  <div className="flex items-center bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all shadow-sm active:scale-90 font-bold text-xl text-gray-400"
                    >
                      −
                    </button>
                    <span className="w-14 text-center font-black text-xl">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(dessert.quantity, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all shadow-sm active:scale-90 font-bold text-xl text-gray-400"
                      disabled={quantity >= dessert.quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Khối Thanh Toán - Thiết kế sáng sủa không dùng màu đen */}
                <div className="bg-gray-50 border-2 border-orange-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Estimated Total</p>
                    <p className="text-4xl font-black text-[#ff5528]">${totalPrice.toFixed(2)}</p>
                  </div>
                  
                  <button
                    onClick={() => addToCartMutation.mutate({ productId: dessert.id, selectedQuantity: quantity })}
                    disabled={dessert.quantity === 0 || isAddingToCart}
                    className={`px-10 py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl active:scale-[0.97] ${
                      dessert.quantity === 0 || isAddingToCart
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-[#ff5528] text-white hover:bg-orange-600 shadow-orange-200"
                    }`}
                  >
                    {isAddingToCart ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                    {isAddingToCart ? "Processing..." : `Order Now (${quantity})`}
                  </button>
                </div>
              </div>

              {/* Thông tin SKU phụ */}
              <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">SKU Reference</span>
                  <span className="text-[#0d0d0d] font-bold">DESS-00{dessert.id}</span>
                </div>
                {dessert.region && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400 font-bold uppercase tracking-tighter">Origin Region</span>
                    <span className="text-[#0d0d0d] font-bold">{dessert.region}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
