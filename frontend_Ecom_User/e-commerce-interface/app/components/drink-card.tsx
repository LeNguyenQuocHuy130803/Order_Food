// "use client"

// import Image from "next/image"
// import { Clock, MapPin, Star, Heart } from "lucide-react"
// import type { DrinkCardProps } from "@/types/drink"
// import { useState } from "react"

// export default function DrinkCard(props: DrinkCardProps) {
//   const [isFavorited, setIsFavorited] = useState(false)
//   const { name, imageUrl, deliveryTime, distance, rating, price, type, description } = props
//   const reviewCount = Math.floor(Math.random() * 401) + 100

//   return (
//     <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
//       {/* Image Container */}
//       <div className="relative w-full h-64 overflow-hidden bg-gray-100">
//         <Image
//           src={imageUrl}
//           alt={name}
//           fill
//           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//           priority={false}
//         />

//         {/* Badge FEATURED */}
//         {type === "FEATURED" && (
//           <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2.5 py-1.5 rounded-full text-xs font-bold">
//             Nổi bật
//           </div>
//         )}

//         {/* Favorite Button */}
//         <button
//           onClick={() => setIsFavorited(!isFavorited)}
//           className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
//         >
//           <Heart
//             size={20}
//             className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
//           />
//         </button>
//       </div>

//       {/* Content Container */}
//       <div className="p-4 flex flex-col gap-3">
//         {/* Name with Order Button */}
//         <div className="flex items-start justify-between gap-2">
//           <h3 className="font-bold text-foreground text-base line-clamp-2 flex-1">
//             {name}
//           </h3>
//           <button className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap">
//             Order
//           </button>
//         </div>

//         {/* Rating */}
//         <div className="flex items-center gap-1.5">
//           <Star size={16} className="fill-yellow-400 text-yellow-400" />
//           <span className="text-sm font-bold text-gray-800">{rating}</span>
//           <span className="text-xs text-gray-500">({reviewCount})</span>
//         </div>

//         {/* Divider */}
//         <div className="border-t border-gray-200"></div>

//         {/* Delivery Info */}
//         <div className="flex items-center justify-between text-xs text-gray-600">
//           <div className="flex items-center gap-1">
//             <Clock size={14} className="text-gray-500" />
//             <span className="font-medium">{deliveryTime}</span>
//           </div>
//           <span className="text-red-500 font-black text-lg">${(price / 1000).toFixed(1)}</span>
//           <div className="flex items-center gap-1">
//             <MapPin size={14} className="text-gray-500" />
//             <span className="font-medium">{distance}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
