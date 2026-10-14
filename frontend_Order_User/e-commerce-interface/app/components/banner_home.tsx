"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Shield, Truck } from "lucide-react";
import { motion, Variants } from "framer-motion";

// 1. Định nghĩa kịch bản xuất hiện (Staggered Entrance)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Hiệu ứng Spring (lò xo) cho cảm giác nảy mạnh mẽ
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      damping: 20, 
      stiffness: 100 
    } 
  },
};


export default function MainSection() {
  return (
    <section className="relative bg-[#0d0d0d] overflow-hidden min-h-[85vh] lg:min-h-[800px] flex items-center pt-20 lg:pt-0">
      
      {/* BACKGROUND ELEMENTS - Parallax Glow & Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#ff5528]/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-[#ffb936]/10 blur-[100px] rounded-full" 
        />

        {/* Các hạt trang trí bay lơ lửng - Đã tách transition để fix lỗi */}
        <motion.div 
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[15%] w-4 h-4 bg-[#ff5528] rounded-full opacity-20 blur-sm" 
        />
        <motion.div 
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] left-[10%] w-6 h-6 bg-[#ffb936] rounded-full opacity-10 blur-sm" 
        />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 lg:pl-32">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          
          {/* LEFT CONTENT: Text & Buttons */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-[#ff5528]/15 border border-[#ff5528]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#ff5528] font-black text-[10px] uppercase tracking-[0.2em]">Fast Food Service</span>
            </motion.div>

            <motion.p variants={itemVariants} className="text-[#ffb936] text-base lg:text-xl mb-3 font-bold italic tracking-wide">
              Crispy, Every Bite Taste
            </motion.p>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-[6rem] font-black text-white mb-6 leading-[0.95] tracking-tighter">
              Delicious<br />
              <motion.span 
                animate={{ color: ["#ff5528", "#ffb936", "#ff5528"] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="drop-shadow-[0_10px_30px_rgba(255,85,40,0.5)]"
              >
                Fried Chicken
              </motion.span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-gray-400 text-sm lg:text-lg mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
              Trải nghiệm hương vị gà rán đỉnh cao chuẩn vị FoodKing. Giòn rụm bên ngoài, mọng nước bên trong với công thức bí truyền.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
              <Link href="/food" className="group relative inline-flex items-center gap-3 bg-[#ff5528] hover:bg-orange-600 text-white font-black px-10 py-5 text-sm rounded-2xl transition-all shadow-[0_15px_30px_rgba(255,85,40,0.3)] active:scale-95">
                KHÁM PHÁ THỰC ĐƠN
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <Link href="/about" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold px-10 py-5 text-sm rounded-2xl border-2 border-white/10 transition-all active:scale-95">
                Tìm hiểu thêm
              </Link>
            </motion.div>

            {/* INFO ICONS */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mt-16 pt-10 border-t border-white/5">
              {[
                { icon: Truck, label: "Giao nhanh", sub: "30 Phút", color: "#ff5528" },
                { icon: Clock, label: "Phục vụ", sub: "24/7", color: "#ffb936" },
                { icon: Shield, label: "An toàn", sub: "Tuyệt đối", color: "#ff5528" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white group-hover:text-[#ff5528] transition-colors">
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] lg:text-[14px] font-black text-white uppercase leading-none mb-1">{item.label}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE: 3D Interaction & Floating Badges */}
          <div className="relative order-1 lg:order-2 flex items-center justify-center lg:justify-end pr-0 lg:pr-10">
            {/* Halo Rotation Effect */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-[350px] h-[350px] md:w-[550px] md:h-[550px] border border-white/5 rounded-full z-0" 
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 1.5 }}
              className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[520px] lg:h-[520px] z-10"
            >
              <div className="absolute inset-0 border-[15px] border-[#ff5528]/10 rounded-full" />
              
              <div className="absolute inset-6 bg-[#0d0d0d] rounded-full overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-4 border-white/5">
                <Image
                  src="/image/banner_main_sections.jpg"
                  alt="FoodKing Fried Chicken"
                  fill
                  priority
                  className="object-cover scale-110"
                />
              </div>

              {/* Badge Giá $9.99 */}
              <motion.div 
                animate={{ y: [0, 13, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-10 bg-[#ffb936] rounded-full w-28 h-28 lg:w-36 lg:h-36 flex flex-col items-center justify-center shadow-2xl border-[6px] border-[#0d0d0d] z-20"
              >
                <span className="text-[#0d0d0d] text-[12px] font-black uppercase tracking-tighter">Chỉ từ</span>
                <span className="text-[#0d0d0d] text-3xl lg:text-5xl font-black tracking-tighter">$9.99</span>
              </motion.div>

              {/* Badge Giảm giá 20% */}
              <motion.div 
                animate={{ 
  x: [0, 20, 0], 
  y: [0, -10, 0] 
}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -left-8 bottom-10 bg-white rounded-[2rem] px-8 py-5 shadow-2xl z-20 border-b-8 border-gray-100"
              >
                <div className="text-[#ff5528] text-[12px] font-black italic tracking-tighter uppercase mb-1">Giảm ngay 20%</div>
                <div className="text-[#0d0d0d] text-[16px] font-black tracking-tight leading-none">Duy nhất hôm nay!</div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* SVG Wave Transition */}
      <div className="absolute bottom-[-2px] left-0 right-0 leading-[0] z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
