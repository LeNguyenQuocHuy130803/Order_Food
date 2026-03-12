"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Star, Heart } from "lucide-react";
import { FilterSidebar } from "../components/filter_sidebar";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import {
  getRandomDeliveryTime,
  getRandomDistance,
  getRandomRating,
} from "@/lib/drink-utils";
import type { Drink, DrinkCardProps } from "@/types/drink";



export default function FoodPage() {
  const [drinks, setDrinks] = useState<DrinkCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});
  const [displayCount, setDisplayCount] = useState(9);
  const [filterResults, setFilterResults] = useState<DrinkCardProps[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("http://localhost:8080/api/drinks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch drinks: ${response.statusText}`);
        }

        const data: Drink[] = await response.json();

        // Transform API data with random properties
        const transformedDrinks: DrinkCardProps[] = data.map((drink) => ({
          ...drink,
          deliveryTime: getRandomDeliveryTime(),
          distance: getRandomDistance(),
          rating: getRandomRating(),
          description: drink.description || drink.category || "Đồ uống",
        }));

        setDrinks(transformedDrinks);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu";
        setError(errorMessage);
        console.error("Error fetching drinks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrinks();
  }, []);

  const handleFilterChange = (results: any[]) => {
    console.log('🎯 Filter results received:', results);
    const transformedResults: DrinkCardProps[] = results.map((drink) => ({
      ...drink,
      deliveryTime: getRandomDeliveryTime(),
      distance: getRandomDistance(),
      rating: getRandomRating(),
      description: drink.description || drink.category || "Đồ uống",
    }));
    
    setFilterResults(transformedResults);
    setDisplayCount(9);
    if (transformedResults.length > 0) {
      setIsFiltering(true);
    }
  };

  const handleResetFilter = () => {
    console.log('🔄 Resetting filter...');
    setIsFiltering(false);
    setFilterResults([]);
    setDisplayCount(9);
  };

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12 pt-22">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">☕ Đồ Uống</h1>
          <p className="text-muted-foreground text-lg">
            Khám phá các loại đồ uống tươi mát từ các quán ăn hàng đầu
          </p>
        </div>

        <div className="flex gap-6">
          <FilterSidebar onFilterChange={handleFilterChange} />

          <div className="flex-1">
            {/* Show filter reset button when filtering */}
            {isFiltering && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <p className="text-blue-700">
                  Đang hiển thị <span className="font-bold text-[#ff5528]">{filterResults.length}</span> kết quả lọc
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !isFiltering && (
              <div className="flex justify-center items-center py-12">
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
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-semibold mb-2">❌ Lỗi tải dữ liệu</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && drinks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không có sản phẩm nào được tìm thấy
                </p>
              </div>
            )}

            {/* Drinks Grid */}
            {!isLoading && !error && (isFiltering ? filterResults : drinks).length > 0 && (
              <>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Hiển thị filtered results hoặc tất cả drinks */}
                  {(isFiltering ? filterResults : drinks).slice(0, displayCount).map((drink) => {
                    const reviewCount = Math.floor(Math.random() * 401) + 100;
                    const isFavorited = favorites[drink.id] || false;

                    return (
                      <Link 
                        key={drink.id}
                        href={`/food/${drink.id}`}
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block"
                        onClick={(e) => {
                          // Prevent navigation khi click vào favorite button
                          if ((e.target as HTMLElement).closest('button')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {/* Image Container */}
                        <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                          {/* Map drink.imageUrl từ API */}
                          <Image
                            src={drink.imageUrl}
                            alt={drink.name}
                            fill
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority={false}
                          />

                          {/* Badge FEATURED - dựa vào drink.type */}
                          {drink.featured === true && (
                            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2.5 py-1.5 rounded-full text-xs font-bold">
                              Nổi bật
                            </div>
                          )}

                          {/* Favorite Button - Toggle favorite state */}
                          <button
                            onClick={() =>
                              setFavorites((prev) => ({
                                ...prev,
                                [drink.id]: !prev[drink.id],  // Toggle favorite status
                              }))
                            }
                            className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                          >
                            <Heart
                              size={20}
                              className={
                                isFavorited
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-400"
                              }
                            />
                          </button>
                        </div>

                        {/* Content Container */}
                        <div className="p-4 flex flex-col gap-3">
                          {/* Name with Order Button - Map drink.name */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-foreground text-base line-clamp-2 flex-1">
                              {drink.name}
                            </h3>
                            <button className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap">
                              Order
                            </button>
                          </div>

                          {/* Rating - Map drink.rating */}
                          <div className="flex items-center gap-1.5">
                            <Star
                              size={16}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            <span className="text-sm font-bold text-gray-800">
                              {drink.rating}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({reviewCount})
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="border-t border-gray-200"></div>

                          {/* Delivery Info - Map drink.deliveryTime, drink.price, drink.distance */}
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock size={14} className="text-gray-500" />
                              <span className="font-medium">
                                {drink.deliveryTime}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-red-500 font-black text-lg">
                                ${(drink.price / 1000).toFixed(1)}
                              </span>
                              <span className="text-red-500 font-bold text-xs">
                                /{drink.unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-500" />
                              <span className="font-medium">{drink.distance}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Load More / Collapse Button */}
                {(isFiltering ? filterResults : drinks).length > 9 && (
                  <div className="mt-12 flex justify-center gap-4">
                    {/* Nút Thu gọn - hiển thị khi displayCount > 9 */}
                    {displayCount > 9 && (
                      <button 
                        onClick={() => setDisplayCount(9)}
                        className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Thu gọn
                      </button>
                    )}

                    {/* Nút Xem thêm - hiển thị khi còn sản phẩm chưa hiển thị */}
                    {displayCount < (isFiltering ? filterResults : drinks).length && (
                      <button 
                        onClick={() => setDisplayCount((prev) => prev + 9)}
                        className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Xem thêm
                      </button>
                    )}
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

