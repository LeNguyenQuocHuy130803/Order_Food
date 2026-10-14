"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Star, Clock, Users, Award, ChefHat, Utensils,
  Phone, MapPin, Facebook, Twitter, Instagram,
  Youtube, Menu, X, ShoppingCart, Search
} from "lucide-react";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { useCartQuery } from "@/hooks/useCartQuery"
import { useAuth } from "@/hooks/useAuth"
// --- CẤU HÌNH DỮ LIỆU (LOẠI BỎ HARD-CODE) ---
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Food", href: "/food" },
  { name: "Fresh", href: "/fresh" },
  { name: "Drink", href: "/drink" },
  { name: "Dessert", href: "/dessert" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Youtube, href: "#" },
];

const FEATURES = [
  { icon: Star, title: "Quality Food", desc: "Sử dụng nguyên liệu sạch, tươi ngon và đạt chuẩn cao nhất." },
  { icon: Clock, title: "Fast Delivery", desc: "Cam kết giao hàng trong 30 phút hoặc miễn phí đơn hàng." },
  { icon: Users, title: "Great Service", desc: "Đội ngũ nhân viên tận tâm, mang lại trải nghiệm tuyệt vời." },
  { icon: Award, title: "Award Winning", desc: "Được bình chọn là nhà hàng tốt nhất thành phố 5 năm liền." },
];

const TEAM_MEMBERS = [
  { name: "Thomas King", role: "Founder & Head Chef", image: "/image/aboutus/chef1.jpg" },
  { name: "Maria Garcia", role: "Executive Chef", image: "/image/aboutus/chef2.jpg" },
  { name: "David Chen", role: "Pastry Chef", image: "/image/aboutus/chef3.jpg" },
  { name: "Huy LeNgQ", role: "King Chef", image: "/image/aboutus/chef4.JPG" },
];

const MISSION_POINTS = [
  "Sử dụng nguyên liệu tươi sạch từ địa phương",
  "Duy trì tiêu chuẩn an toàn thực phẩm cao nhất",
  "Cung cấp dịch vụ nhanh chóng và thân thiện",
  "Đóng góp tích cực cho cộng đồng"
];

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
};



export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {  isAuthenticated } = useAuth()
  const { itemCount } = useCartQuery(isAuthenticated)
  console.log("log xem số lượng item :", itemCount);
  

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* 1. TOP BAR & HEADER (Sử dụng cấu trúc rút gọn) */}
      <div className="bg-[#0d0d0d] text-white py-2 hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-[#ff5528]" />
              <span>789 Pastry Lane, Foodking City</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-[#ff5528]" />
              <span>Mở cửa: 9:00 AM - 10:00 PM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((s, i) => (
              <a key={i} href={s.href} className="hover:text-[#ff5528] transition-colors"><s.icon size={14} /></a>
            ))}
          </div>
        </div>
      </div>

      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-11 h-11 bg-[#ff5528] rounded-full flex items-center justify-center transition-transform group-hover:rotate-12">
              <span className="text-white font-black text-xl">FK</span>
            </div>
            <span className="text-2xl font-black text-[#0d0d0d] tracking-tighter uppercase">Food<span className="text-[#ff5528]">King</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <Link key={item.name} href={item.href} className="text-xs font-black uppercase tracking-widest text-gray-600 hover:text-[#ff5528] transition-colors">
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Search size={20} /></button>
            <Link href="/cart" className="relative group active:scale-95 transition-transform">
              <div className="w-11 h-11 rounded-full bg-[#ff5528] text-white flex items-center justify-center shadow-lg shadow-orange-100 group-hover:bg-[#e64a22]">
                <ShoppingCart size={20} />
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#ffb936] text-[#0d0d0d] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link
              href="/food"
              className="hidden lg:flex items-center gap-2 bg-[#ff5528] text-white px-6 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#e04420] transition-all active:scale-95 shadow-lg shadow-orange-200"
            >
              <Phone size={14} />
              Order Now
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden bg-white border-t p-6 flex flex-col gap-4 font-black text-xs uppercase tracking-widest">
            {NAV_LINKS.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className="hover:text-[#ff5528]">
                {item.name}
              </Link>
            ))}
          </motion.nav>
        )}
      </header>

      {/* 2. PAGE BANNER (Parallax Effect) */}
      <section className="relative bg-[#0d0d0d] py-32 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image src="/image/aboutus/banner_header.jpg" alt="Restaurant" fill className="object-cover" />
        </motion.div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter">About Us</motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-3 text-white/70 font-bold uppercase text-xs tracking-widest">
            <Link href="/" className="hover:text-[#ff5528]">Home</Link>
            <span className="text-[#ff5528]">/</span>
            <span className="text-white">About Us</span>
          </motion.div>
        </div>
      </section>

      {/* 3. OUR STORY (Scroll Reveal) */}
      <section id="story" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInLeft}
              className="relative"
            >
              <div className="relative w-full aspect-square border-[10px] border-gray-50 rounded-[3rem] overflow-hidden shadow-2xl">
                <Image src="/image/aboutus/banner_aboutus.jpg" alt="Our Story" fill className="object-cover" />
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="absolute -bottom-8 -right-8 bg-[#ff5528] text-white p-10 rounded-[2rem] shadow-2xl shadow-orange-200"
              >
                <p className="text-6xl font-black italic">25+</p>
                <p className="text-xs font-black uppercase tracking-widest mt-2">Năm kinh nghiệm</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInRight}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[#ff5528] font-black text-xs uppercase tracking-[0.3em]">Câu chuyện của chúng tôi</span>
                <h2 className="text-4xl md:text-5xl font-black text-[#0d0d0d] leading-none uppercase tracking-tighter">The Best Tasty Food Restaurant</h2>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed">
                Được thành lập vào năm 1998, FoodKing bắt đầu từ một gian bếp gia đình nhỏ với ước mơ lớn - phục vụ món gà rán ngon nhất thành phố. Công thức bí mật của chúng tôi được hoàn thiện qua hơn 10 năm thử nghiệm.
              </p>
              <p className="text-gray-500 font-medium leading-relaxed">
                Ngày nay, chúng tôi đã phát triển thành một chuỗi nhà hàng được yêu thích với hơn 50 chi nhánh. Nhưng cam kết về chất lượng và hương vị gia đình vẫn không bao giờ thay đổi.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-16 h-16 bg-[#fff8f0] rounded-2xl flex items-center justify-center group-hover:bg-[#ff5528] transition-colors duration-500">
                    <ChefHat className="w-8 h-8 text-[#ff5528] group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#0d0d0d]">50+</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Expert Chefs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-16 h-16 bg-[#fff8f0] rounded-2xl flex items-center justify-center group-hover:bg-[#ff5528] transition-colors duration-500">
                    <Utensils className="w-8 h-8 text-[#ff5528] group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#0d0d0d]">150+</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Menu Items</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES (Staggered Animation) */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <span className="text-[#ff5528] font-black text-xs uppercase tracking-widest">Tại sao chọn chúng tôi</span>
            <h2 className="text-4xl font-black text-[#0d0d0d] mt-4 uppercase tracking-tighter">Những tính năng vượt trội</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURES.map((item, index) => (
              <motion.div
                key={index} variants={fadeInUp}
                className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all text-center group"
              >
                <div className="w-20 h-20 bg-[#ff5528] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-[15deg] transition-all duration-500">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-black text-[#0d0d0d] mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. OUR TEAM (Hover Effect) */}
      <section id="team" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <span className="text-[#ff5528] font-black text-xs uppercase tracking-widest">Đội ngũ của chúng tôi</span>
            <h2 className="text-4xl font-black text-[#0d0d0d] mt-4 uppercase tracking-tighter">Gặp gỡ những đầu bếp tài năng</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {TEAM_MEMBERS.map((chef, index) => (
              <motion.div key={index} variants={fadeInUp} className="group">
                <div className="relative h-[400px] rounded-[2rem] overflow-hidden mb-6 shadow-lg">
                  <Image src={chef.image} alt={chef.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#ff5528]/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-10">
                    <div className="flex gap-3">
                      {SOCIAL_LINKS.slice(0, 3).map((s, i) => (
                        <a key={i} href={s.href} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#0d0d0d] hover:text-white transition-colors">
                          <s.icon size={16} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#0d0d0d] text-center uppercase tracking-tighter">{chef.name}</h3>
                <p className="text-[#ff5528] text-center font-black text-[10px] uppercase tracking-widest mt-1">{chef.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. MISSION (Call to Action) */}
      <section id="mission" className="py-24 bg-[#0d0d0d] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInLeft} className="space-y-8">
              <div className="space-y-4">
                <span className="text-[#ff5528] font-black text-xs uppercase tracking-widest">Sứ mệnh của chúng tôi</span>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">Delivering <br /> Happiness</h2>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed italic">
                &quot;Chúng tôi tin rằng món ăn ngon có sức mạnh kết nối mọi người lại với nhau. Sứ mệnh của FoodKing là mang niềm vui đến từng bàn ăn.&quot;
              </p>
              <ul className="space-y-5">
                {MISSION_POINTS.map((item, index) => (
                  <li key={index} className="flex items-center gap-4 text-white font-bold text-sm">
                    <div className="w-6 h-6 bg-[#ff5528] rounded-full flex items-center justify-center shrink-0">
                      <Star size={12} className="text-white fill-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInRight}
              className="relative"
            >
              <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden border-[10px] border-white/5 shadow-2xl">
                <Image src="/image/aboutus/banner3.jpg" alt="Our Mission" fill className="object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER (Tối ưu đồng bộ) */}
      <footer className="bg-[#0d0d0d] text-white pt-24 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#ff5528] rounded-full flex items-center justify-center">
                  <span className="text-white font-black text-lg">FK</span>
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">FoodKing</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">Serving delicious food with love since 1998.</p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((s, i) => (
                  <a key={i} href={s.href} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#ff5528] transition-all"><s.icon size={16} /></a>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em]">Quick Links</h4>
              <ul className="space-y-3 text-gray-500 text-sm font-bold">
                {NAV_LINKS.slice(0, 4).map((l) => (
                  <li key={l.name}><Link href={l.href} className="hover:text-[#ff5528] transition-colors">/ {l.name}</Link></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em]">Giờ làm việc</h4>
              <ul className="space-y-3 text-gray-500 text-xs font-bold uppercase tracking-tight">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>T2 - T6</span><span className="text-white">9:00 - 22:00</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Thứ 7</span><span className="text-white">10:00 - 23:00</span></li>
                <li className="flex justify-between"><span>Chủ Nhật</span><span className="text-white">11:00 - 21:00</span></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em]">Liên hệ</h4>
              <ul className="space-y-4 text-gray-500 text-sm font-medium">
                <li className="flex gap-3"><MapPin size={18} className="text-[#ff5528] shrink-0" /> 789 Pastry Lane, Foodking City</li>
                <li className="flex gap-3"><Phone size={18} className="text-[#ff5528] shrink-0" /> +1 234 567 890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
            &copy; 2024 FoodKing. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
