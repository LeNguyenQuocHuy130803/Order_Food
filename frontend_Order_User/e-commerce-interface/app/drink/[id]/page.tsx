"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ArrowLeft, ShoppingCart } from "lucide-react";

import type { Drink } from "@/types/drink";
import { DrinkService } from "@/service/DrinkService";
import { ProductHeader } from "@/app/components/layout/product-header";
import { Footer } from "@/app/components/layout/footer";


export default function DrinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const drinkId = params.id as string;

  const [drink, setDrink] = useState<Drink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchDrinkDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await DrinkService.getDrinkById(Number(drinkId));
        setDrink(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error loading data";
        setError(errorMessage);
        console.error("Error fetching drink detail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (drinkId) {
      fetchDrinkDetail();
    }
  }, [drinkId]);

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

  if (error || !drink) {
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

  const totalPrice = drink.price * quantity;

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
                src={drink.imageUrl}
                alt={drink.name}
                fill
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />

              {/* Featured Badge */}
              {drink.featured === true && (
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
                {drink.category}
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                {drink.name}
              </h1>
            </div>

            {/* Description */}
            <div className="flex gap-8 items-start py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-foreground min-w-max">Description</h2>
              <p className="text-gray-600 leading-relaxed text-base">
                {drink.description}
              </p>
            </div>

            {/* Stock Info */}
            <div className="flex items-center gap-4 py-4 bg-gray-50  rounded-lg">
              <span className="font-semibold text-gray-700">Stock:</span>
              <span className="text-xl font-bold text-primary">
                {drink.quantity} cái
              </span>
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
                drink.quantity > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {drink.quantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Price Section */}
            <div className="py-6 border-t border-b border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Price</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-red-500">
                  ${(drink.price / 1000).toFixed(1)}
                </span>
                <span className="text-xl font-bold text-red-500">
                  /{drink.unit}
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
                    setQuantity(Math.min(drink.quantity, quantity + 1))
                  }
                  className="px-4 py-2 text-lg font-bold hover:bg-gray-100 transition-colors"
                  disabled={quantity >= drink.quantity}
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
              disabled={drink.quantity === 0}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${
                drink.quantity === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl active:scale-95"
              }`}
            >
              <ShoppingCart size={24} />
              <span>Order Now ({quantity} items)</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
