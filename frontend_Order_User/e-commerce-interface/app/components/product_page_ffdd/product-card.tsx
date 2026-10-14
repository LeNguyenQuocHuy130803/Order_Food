"use client";

import Image from "next/image";
import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAddToCart } from "@/hooks/useAddToCart";
import { PRODUCT_TYPES, type ProductType } from "@/types/cart";

interface Product {
  id: number;
  name: string;
  imageUrl?: string;
  price: number;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  type: "drink" | "food" | "fresh" | "dessert";
}

const PRODUCT_TYPE_BY_CARD_TYPE: Record<ProductCardProps["type"], ProductType> = {
  drink: PRODUCT_TYPES.DRINK,
  food: PRODUCT_TYPES.FOOD,
  fresh: PRODUCT_TYPES.FRESH,
  dessert: PRODUCT_TYPES.DESSERT,
};

export default function ProductCard({ product, type }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { addToCartAsync, isLoading } = useAddToCart();
  const { id, name, imageUrl, featured, price } = product;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productType = PRODUCT_TYPE_BY_CARD_TYPE[type];
      await addToCartAsync({ productType, productId: id, quantity: 1 });

      toast.success("Đã thêm vào giỏ hàng", {
        description: name,
        duration: 2000,
        action: {
          label: "Giỏ hàng",
          onClick: () => window.location.assign("/cart"),
        },
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể thêm vào giỏ hàng");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8 }} 
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link href={`/${type}/${id}`} className="group block h-full">
        <div className="relative bg-white rounded-4xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full">
          
          {/* Image Section - Giữ tỷ lệ 4/3 nhưng thu nhỏ padding cảm giác */}
          <div className="relative w-full aspect-4/3 overflow-hidden bg-gray-50">
            <Image
              src={imageUrl || "/image/placeholder.jpg"}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
            />

            {featured && (
              <div className="absolute top-4 left-4 bg-[#ff5528] text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                Best Seller
              </div>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorited(!isFavorited);
              }}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all active:scale-75 z-10"
            >
              <Heart
                size={16}
                className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
              />
            </button>
          </div>

          {/* Content Section - Giảm padding từ 7 xuống 5 */}
          <div className="p-5 flex flex-col grow">
            <div className="flex justify-between items-start gap-3 mb-4">
              <h3 className="font-bold text-gray-800 text-sm lg:text-base line-clamp-2 leading-tight group-hover:text-[#ff5528] transition-colors">
                {name}
              </h3>
              <p className="text-[#ff5528] font-black text-base lg:text-lg whitespace-nowrap">
                {price.toLocaleString("vi-VN")}₫
              </p>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full bg-[#ff5528] hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold py-3 px-4 rounded-xl text-[11px] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-orange-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShoppingCart size={16} />
                )}
                {isLoading ? "ĐANG THÊM..." : "ĐẶT MÓN NGAY"}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
