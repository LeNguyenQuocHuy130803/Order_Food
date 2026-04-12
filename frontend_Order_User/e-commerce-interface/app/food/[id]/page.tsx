"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ArrowLeft, ShoppingCart } from "lucide-react";

import type { Food } from "@/types/food";
import { FoodService } from "@/service/FoodService";
import { CartService } from "@/service/CartService";
import { ProductHeader } from "@/app/components/layout/product-header";
import { Footer } from "@/app/components/layout/footer";import { useCartQuery } from "@/hooks/useCartQuery"

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const foodId = params.id as string;  const { refetch: refetchCart } = useCartQuery()
  const [food, setFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // 🛒 Xử lý thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      setCartError(null);
      setCartSuccess(false);

      if (!food) return;

      console.log(`🛒 [FoodDetailPage] Adding to cart:`, {
        productType: "FOOD",
        productId: food.id,
        quantity,
      });

      // ✅ Gọi CartService để thêm vào giỏ hàng
      const cartData = await CartService.addProductToCart("FOOD", food.id, quantity);

      console.log(`✅ [FoodDetailPage] Added to cart success:`, cartData);
      setCartSuccess(true);
      // 🔄 Refetch cart count ở header
      await refetchCart()
      // Reset quantity
      setQuantity(1);

      // Ẩn success message sau 2 giây
      setTimeout(() => setCartSuccess(false), 2000);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to add to cart";
      console.log(`⚠️ [FoodDetailPage] Error:`, errorMsg);
      setCartError(errorMsg);

      // Ẩn error message sau 3 giây
      setTimeout(() => setCartError(null), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    const fetchFoodDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await FoodService.getFoodById(Number(foodId));
        setFood(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error loading data";
        setError(errorMessage);
        console.error("Error fetching food detail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (foodId) {
      fetchFoodDetail();
    }
  }, [foodId]);

  if (isLoading) {
    return (
      <main className="bg-background min-h-screen">
        <ProductHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 pt-22">
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !food) {
    return (
      <main className="bg-background min-h-screen">
        <ProductHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 pt-22">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700 font-semibold text-lg mb-4">
              ❌ {error || "Product not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const totalPrice = food.price * quantity;

  return (
    <main className="bg-background min-h-screen">
      <ProductHeader />

      <div className="max-w-7xl mx-auto px-4 py-12 pt-22">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative w-full h-96 rounded-3xl overflow-hidden bg-gray-100 group">
              <Image
                src={food.imageUrl}
                alt={food.name}
                fill
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />

              {/* Featured Badge */}
              {food.featured === true && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                  Best Seller
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Heart
                  size={24}
                  className={
                    isFavorited
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                  }
                />
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-2">
            {/* Product Name */}
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2 uppercase">
                {food.category}
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                {food.name}
              </h1>
            </div>

            {/* Description */}
            <div className="flex gap-8 items-start py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-foreground min-w-max">Description</h2>
              <p className="text-gray-600 leading-relaxed text-base">
                {food.description}
              </p>
            </div>

            {/* Stock Info */}
            <div className="flex items-center gap-4 py-4 bg-gray-50  rounded-lg">
              <span className="font-semibold text-gray-700">Stock:</span>
              <span className="text-xl font-bold text-primary">
                {food.quantity} cái
              </span>
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
                food.quantity > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {food.quantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Price Section */}
            <div className="py-6 border-t border-b border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Price</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-red-500">
                  ${(food.price / 1000).toFixed(1)}
                </span>
                <span className="text-xl font-bold text-red-500">
                  /{food.unit}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-2 font-bold text-lg border-l border-r border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(food.quantity, quantity + 1))
                  }
                  className="px-4 py-2 text-lg font-bold hover:bg-gray-100 transition-colors"
                  disabled={quantity >= food.quantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-primary/10 px-6 py-4 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Total</p>
              <p className="text-3xl font-black text-primary">
                ${(totalPrice / 1000).toFixed(1)}
              </p>
            </div>

            {/* Order Button */}
            <button
              onClick={handleAddToCart}
              disabled={food.quantity === 0 || isAddingToCart}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${
                food.quantity === 0 || isAddingToCart
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl active:scale-95"
              }`}
            >
              <ShoppingCart size={24} />
              <span>
                {isAddingToCart ? "Adding..." : `Order Now (${quantity} items)`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {cartSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm text-center shadow-lg">
            {/* Checkmark Icon */}
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Message */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Sản phẩm đã được thêm vào Giỏ hàng
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {food?.name}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCartSuccess(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition"
              >
                Xem Tiếp
              </button>
              <button
                onClick={() => {
                  setCartSuccess(false);
                  // TODO: Navigate to cart page
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Xem Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {cartError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
          <p className="text-red-800 font-medium">✗ {cartError}</p>
        </div>
      )}

      <Footer />
    </main>
  );
}
