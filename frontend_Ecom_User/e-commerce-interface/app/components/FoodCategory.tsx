"use client"

import { Clock, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
export default function FoodCategory() {
  const categories = [
    { name: "Burger", icon: "/image/category1.jpg", count: "25 Items" },
    { name: "Pizza", icon: "/image/category2.jpg", count: "18 Items" },
    { name: "Chicken", icon: "/image/category3.jpg", count: "32 Items" },
    { name: "French Fry", icon: "/image/category4.jpg", count: "15 Items" },
    { name: "Hot Dog", icon: "/image/category5.jpg", count: "12 Items" },
  ]

  const foodpopular = [
    { name: "Crispy Chicken Wings", price: "$12.99", desc: "8 pcs crispy wings with special sauce", rating: 4.8, image: "/image/foodpopular1.jpg" },
    { name: "Classic Cheeseburger", price: "$9.99", desc: "Beef patty with cheddar cheese", rating: 4.9, image: "/image/foodpopular2.jpg" },
    { name: "Pepperoni Pizza", price: "$14.99", desc: "12 inch with extra cheese", rating: 4.7, image: "/image/category2.jpg" },
    { name: "Loaded Fries", price: "$7.99", desc: "Fries with cheese and bacon", rating: 4.6, image: "/image/category4.jpg" },
    { name: "BBQ Ribs", price: "$18.99", desc: "Half rack with BBQ glaze", rating: 4.9, image: "/image/category1.jpg" },
    { name: "Fish & Chips", price: "$11.99", desc: "Crispy battered fish fillets", rating: 4.5, image: "/image/category5.jpg" },

  ]
  return (
    <main>

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

      {/* on sales */}
            <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Offer Card 1 */}
          <div className="relative bg-[#ff5528] rounded-3xl overflow-hidden p-8 min-h-[300px] flex items-end">
            <div className="relative z-10 max-w-xs">
              <span className="text-white font-semibold text-xs uppercase tracking-wider">Today Only</span>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mt-2 mb-3">
                Chicken Combo
              </h3>
              <p className="text-white/90 text-sm mb-4">Get 30% off on all chicken combos</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-white">$8.99</span>
                <span className="text-lg text-white/60 line-through">$12.99</span>
              </div>
              <Button className="bg-white text-[#ff5528] hover:bg-gray-100 font-bold px-6 py-2 rounded-full text-sm">
                Order Now
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 w-56 h-56 lg:w-64 lg:h-64">
              <Image
                src="/image/category3.jpg"
                alt="Chicken Combo"
                width={256}
                height={256}
                className="object-contain"
              />
            </div>
          </div>

          {/* Offer Card 2 */}
          <div className="relative bg-[#ffb936] rounded-3xl overflow-hidden p-8 min-h-[300px] flex items-end">
            <div className="relative z-10 max-w-xs">
              <span className="text-black font-semibold text-xs uppercase tracking-wider">Weekend Special</span>
              <h3 className="text-2xl lg:text-3xl font-bold text-black mt-2 mb-3">
                Burger Combo
              </h3>
              <p className="text-black/80 text-sm mb-4">Free drink with every burger</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-black">$10.99</span>
                <span className="text-lg text-black/50 line-through">$15.99</span>
              </div>
              <Button className="bg-black text-white hover:bg-gray-800 font-bold px-6 py-2 rounded-full text-sm">
                Order Now
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 w-56 h-56 lg:w-64 lg:h-64">
              <Image
                src="/image/category1.jpg"
                alt="Burger Combo"
                width={256}
                height={256}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    
      {/* popular products */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-[#ff5528] font-semibold text-sm uppercase tracking-wider">Our Menu</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0d0d0d] mt-2">Most Popular Delicious Food</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodpopular.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-[#ffb936] fill-[#ffb936]" />
                    <span className="font-semibold text-sm">{item.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0d0d0d]">{item.name}</h3>
                  <p className="text-gray-500 mt-2">{item.desc}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold text-[#ff5528]">{item.price}</span>
                    <button className="bg-[#ff5528] text-white px-4 py-2 rounded-full hover:bg-[#e04420] transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* about us */}
      <section className="py-12 lg:py-16 bg-[#fff8f0]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="relative w-full aspect-square max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto lg:mx-0">
                <Image
                  src="/image/aboutimage.jpg"
                  alt="About FoodKing"
                  fill
                  className="object-cover rounded-3xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6  bg-[#ff5528] text-white p-6 rounded-2xl shadow-xl">
                <p className="text-4xl font-bold">25+</p>
                <p className="text-sm">Years of Experience</p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <span className="text-[#ff5528] font-semibold text-sm uppercase tracking-wider">About Us</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#0d0d0d] mt-2">
                  Best Quality Food For Your Family
                </h2>
              </div>
              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                FoodKing is a family-owned restaurant that has been serving delicious food since 1998. We use only the freshest ingredients and our recipes have been passed down through generations.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 pb-2">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#ff5528] rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0d0d0d] text-sm">Quality Food</h4>
                    <p className="text-gray-500 text-xs">Fresh ingredients daily</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#ffb936] rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0d0d0d] text-sm">Fast Delivery</h4>
                    <p className="text-gray-500 text-xs">30 mins or free</p>
                  </div>
                </div>
              </div>
              <Button className="bg-[#ff5528] hover:bg-[#e04a22] text-white px-8 py-3 rounded-full font-semibold text-sm -mt-1">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}