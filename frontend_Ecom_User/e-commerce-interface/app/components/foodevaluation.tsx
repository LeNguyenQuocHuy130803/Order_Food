"use client";
import Image from "next/image";
import { Star } from "lucide-react";

export default function FoodEvaluation() {
    const evaluation = [
        { name: "Sarah Johnson", role: "Food Blogger", text: "The best fried chicken I've ever had! Crispy outside, juicy inside. Absolutely perfect.", avatar: "/image/evaluation1.jpg" },
              { name: "Michael Chen", role: "Regular Customer", text: "Been coming here for 5 years. The quality never drops. Their burgers are amazing!", avatar: "/image/evaluation2.jpg" },
              { name: "Emily Davis", role: "Food Critic", text: "FoodKing delivers on taste and quality. The ambiance is great and staff is friendly.", avatar: "/image/evaluation3.jpg" },
    ]
  return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#ff5528] font-semibold">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d0d0d] mt-2">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {evaluation.map((item, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-[#ffb936] fill-[#ffb936]" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">{item.text}</p>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[#0d0d0d]">{item.name}</p>
                    <p className="text-gray-500 text-sm">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}