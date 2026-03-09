"use client"
import Image from "next/image";
import { Button } from "./ui/button";

export default function SpecialOffer() {
  return (
        <section className="py-16 lg:py-5 bg-[#fff8f5]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-7">
          {/* Offer Card 1 */}
          <div className="relative bg-[#0d0d0d] rounded-3xl overflow-hidden p-7 lg:p-10 min-h-[280px] flex items-center">
            <div className="relative z-10 max-w-sm">
              <span className="text-[#ffb936] font-semibold text-sm uppercase tracking-wider">Today Only!</span>
              <h3 className="text-3xl lg:text-4xl font-bold text-white mt-2 mb-4">
                Get Your Free <span className="text-[#ff5528]">Chicken</span> Now
              </h3>
              <p className="text-gray-400 mb-6">Order above $50 and get a free chicken bucket!</p>
              <Button className="bg-[#ff5528] hover:bg-[#e04a22] text-white font-bold px-8 py-3 rounded-full">
                ORDER NOW
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 w-48 h-48 lg:w-64 lg:h-64">
              <Image
                src="/image/category3.jpg"
                alt="Free Chicken"
                width={256}
                height={256}
                className="object-contain"
              />
            </div>
          </div>

          {/* Offer Card 2 */}
          <div className="relative bg-[#ff5528] rounded-3xl overflow-hidden p-6 lg:p-8 min-h-[280px] flex items-center">
            <div className="relative z-10 max-w-sm">
              <span className="text-[#ffb936] font-semibold text-sm uppercase tracking-wider">Special Offer</span>
              <h3 className="text-3xl lg:text-4xl font-bold text-white mt-2 mb-4">
                Delicious <span className="text-[#0d0d0d]">Burger</span> Combo
              </h3>
              <p className="text-white/80 mb-6">Save up to 30% on our burger combo meals!</p>
              <Button className="bg-[#0d0d0d] hover:bg-black text-white font-bold px-8 py-3 rounded-full">
                ORDER NOW
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 w-48 h-48 lg:w-64 lg:h-64">
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
  );
}