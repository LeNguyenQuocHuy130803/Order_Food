"use client"

import Image from "next/image";
export default function FoodCategory() {
      const categories = [
    { name: "Burger", icon: "/image/category1.jpg", count: "25 Items" },
    { name: "Pizza", icon: "/image/category2.jpg", count: "18 Items" },
    { name: "Chicken", icon: "/image/category3.jpg", count: "32 Items" },
    { name: "French Fry", icon: "/image/category4.jpg", count: "15 Items" },
    { name: "Hot Dog", icon: "/image/category1.jpg", count: "12 Items" },
  ]

  return (
        <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[#ff5528] font-semibold text-sm uppercase tracking-wider">Food Category</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0d0d0d] mt-2">Popular Food Items</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-[#ff5528] hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-[#fff5f2] group-hover:scale-110 transition-transform">
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-[#0d0d0d] text-lg mb-1 group-hover:text-[#ff5528] transition-colors">{category.name}</h3>
              <p className="text-gray-500 text-sm">{category.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}