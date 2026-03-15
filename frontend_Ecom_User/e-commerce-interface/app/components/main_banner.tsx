"use client"

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export default function MainSection() {
  return (
    <section className="relative bg-[#0d0d0d] overflow-hidden min-h-[700px]">
      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10 lg:pl-32">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-[#ff5528]/20 border border-[#ff5528]/40 rounded-full px-4 py-2 mb-6">
              <span className="text-[#ff5528] font-semibold text-sm uppercase tracking-wider">Fast Food</span>
            </div>
            
            <p className="text-[#ffb936] text-lg lg:text-xl mb-4 font-medium">Crispy, Every Bite Taste</p>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              Delicious<br />
              <span className="text-[#ff5528]">Fried Chicken</span>
            </h1>
            
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
              Experience the best fried chicken in town. Crispy on the outside, juicy on the inside.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button className="bg-[#ff5528] hover:bg-[#e04a22] text-white font-bold px-8 py-6 text-lg rounded-full group">
                ORDER NOW
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-800">
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-[#ff5528]">15+</div>
                <div className="text-gray-400 text-sm">Years Experience</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-[#ff5528]">5K+</div>
                <div className="text-gray-400 text-sm">Happy Customers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-[#ff5528]">100+</div>
                <div className="text-gray-400 text-sm">Food Menu</div>
              </div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 flex items-center justify-center">
            <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-[#ff5528] to-[#ffb936] rounded-full opacity-20 blur-3xl" />
            
            <div className="relative w-[280px] h-[280px] md:w-[380px] md:h-[380px] lg:w-[480px] lg:h-[480px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff5528] to-[#ffb936] rounded-full" />
              <div className="absolute inset-2 bg-[#0d0d0d] rounded-full" />
              <div className="absolute inset-4 bg-gradient-to-br from-[#ff5528] to-[#ffb936] rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src="/image/banner_main_sections.jpg"
                  alt="Delicious Fried Chicken"
                  width={450}
                  height={450}
                  className="object-cover scale-125"
                />
              </div>
              
              <div className="absolute -right-4 top-1/4 bg-[#ffb936] rounded-full w-20 h-20 lg:w-24 lg:h-24 flex flex-col items-center justify-center shadow-xl">
                <span className="text-[#0d0d0d] text-xs font-medium">Only</span>
                <span className="text-[#0d0d0d] text-xl lg:text-2xl font-bold">$9.99</span>
              </div>

              <div className="absolute -left-4 bottom-1/4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                <div className="text-[#ff5528] text-xs font-semibold">SAVE 20%</div>
                <div className="text-[#0d0d0d] text-sm font-bold">Today Only!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
