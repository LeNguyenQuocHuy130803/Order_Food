// "use client";

// import { useEffect, useState } from "react";
// import { FilterSidebar } from "../components/filter_sidebar";
// import { Footer } from "../components/footer";
// import { Header } from "../components/header";
// import DrinkCard from "../components/drink-card";
// import {
//   getRandomDeliveryTime,
//   getRandomDistance,
//   getRandomRating,
// } from "@/lib/drink-utils";
// import type { Drink, DrinkCardProps } from "@/types/drink";

// // ============================================
// // VIA COMPONENT APPROACH
// // ============================================
// // File này dùng DrinkCard component thay vì map trực tiếp
// // Nếu muốn dùng cách này:
// //   1. Rename file này thành page.tsx
// //   2. Backup file page.tsx hiện tại (inline map)
// // Để dùng lại inline map: làm ngược lại
// // ============================================

// export default function FoodPage() {
//   const [drinks, setDrinks] = useState<DrinkCardProps[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchDrinks = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);

//         const response = await fetch("http://localhost:8080/api/drinks", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           cache: "no-store",
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch drinks: ${response.statusText}`);
//         }

//         const data: Drink[] = await response.json();

//         // Transform API data with random properties
//         const transformedDrinks: DrinkCardProps[] = data.map((drink) => ({
//           ...drink,
//           deliveryTime: getRandomDeliveryTime(),
//           distance: getRandomDistance(),
//           rating: getRandomRating(),
//           description: drink.description || drink.category || "Đồ uống",
//         }));

//         setDrinks(transformedDrinks);
//       } catch (err) {
//         const errorMessage =
//           err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu";
//         setError(errorMessage);
//         console.error("Error fetching drinks:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDrinks();
//   }, []);

//   return (
//     <main className="bg-background min-h-screen">
//       <Header />

//       <div className="max-w-7xl mx-auto px-4 py-12 pt-22">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-foreground mb-2">☕ Đồ Uống</h1>
//           <p className="text-muted-foreground text-lg">
//             Khám phá các loại đồ uống tươi mát từ các quán ăn hàng đầu
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           <FilterSidebar />

//           <div className="lg:col-span-3">
//             {/* Loading State */}
//             {isLoading && (
//               <div className="flex justify-center items-center py-12">
//                 <div className="animate-spin">
//                   <svg
//                     className="w-12 h-12 text-primary"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     />
//                   </svg>
//                 </div>
//               </div>
//             )}

//             {/* Error State */}
//             {error && !isLoading && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//                 <p className="text-red-700 font-semibold mb-2">❌ Lỗi tải dữ liệu</p>
//                 <p className="text-red-600 text-sm mb-4">{error}</p>
//                 <button
//                   onClick={() => window.location.reload()}
//                   className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//                 >
//                   Thử lại
//                 </button>
//               </div>
//             )}

//             {/* Empty State */}
//             {!isLoading && !error && drinks.length === 0 && (
//               <div className="text-center py-12">
//                 <p className="text-gray-500 text-lg">
//                   Không có sản phẩm nào được tìm thấy
//                 </p>
//               </div>
//             )}

//             {/* Drinks Grid - Dùng Component */}
//             {!isLoading && !error && drinks.length > 0 && (
//               <>
//                 {/* 
//                   Render qua DrinkCard component
//                   - Spread toàn bộ drink object: {...drink}
//                   - Component tự quản lý local state (isFavorited)
//                   - Dễ tái sử dụng ở nhiều page khác
//                 */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {drinks.map((drink) => (
//                     <DrinkCard key={drink.id} {...drink} />
//                   ))}
//                 </div>

//                 {/* Load More Button */}
//                 <div className="mt-12 text-center">
//                   <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
//                     Xem thêm
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </main>
//   );
// }
