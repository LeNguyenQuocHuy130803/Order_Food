"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, User, MessageCircle, ArrowLeft, Phone, MapPin,
  Facebook, Twitter, Instagram, Youtube, Menu, X,
  ShoppingCart, Search, Calendar, Star
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCartQuery } from "@/hooks/useCartQuery";
import { BlogService } from "@/service/BlogService";

// --- CẤU HÌNH DỮ LIỆU ---
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Food", href: "/food" },
  { name: "Fresh", href: "/fresh" },
  { name: "Drink", href: "/drink" },
  { name: "Dessert", href: "/dessert" },
  { name: "About Us", href: "/about_us" },
  { name: "Contact", href: "/contact" },
];

// --- STAR RATING COMPONENT ---
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((index) => {
        const fillPercentage = Math.max(0, Math.min(100, (rating - index) * 100));
        const isFilled = fillPercentage === 100;
        const isPartial = fillPercentage > 0 && fillPercentage < 100;

        return (
          <div key={index} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="text-gray-300 absolute top-0 left-0" fill="currentColor" />
            {(isFilled || isPartial) && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: `${fillPercentage}%`,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <Star size={size} className="text-[#ffb936]" fill="currentColor" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = parseInt(params.id as string);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { itemCount } = useCartQuery(isAuthenticated);

  // 📄 Fetch blog detail
  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["blog", blogId],
    queryFn: () => BlogService.getBlogById(blogId),
    staleTime: 1000 * 60 * 10, // Cache 10 phút
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 font-semibold">Đang tải bài viết...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-6">
        <p className="text-red-500 font-semibold">Lỗi khi tải bài viết</p>
        <Link href="/blog" className="flex items-center gap-2 text-[#ff5528] font-black uppercase">
          <ArrowLeft size={18} /> Quay lại blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* Floating Back Button */}
      <Link 
        href="/blog"
        className="fixed bottom-8 right-8 bg-[#ff5528] text-white p-4 rounded-full shadow-2xl hover:bg-[#e64a22] hover:scale-110 transition-all z-40 flex items-center justify-center group"
        title="Quay lại"
      >
        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
      </Link>

      {/* 1. TOP BAR */}
      <div className="bg-[#0d0d0d] text-white py-2 hidden lg:block text-[11px] font-black uppercase tracking-[0.2em]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><MapPin size={12} className="text-[#ff5528]" /> 789 Pastry Lane, City</div>
            <div className="flex items-center gap-2"><Clock size={12} className="text-[#ff5528]" /> Open: 9:00 AM - 10:00 PM</div>
          </div>
          <div className="flex items-center gap-4">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="hover:text-[#ff5528] transition-colors"><Icon size={14} /></a>
            ))}
          </div>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-11 h-11 bg-[#ff5528] rounded-full flex items-center justify-center font-black text-white text-xl group-hover:rotate-12 transition-transform">FK</div>
            <span className="text-2xl font-black tracking-tighter uppercase">Food<span className="text-[#ff5528]">King</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.name} href={link.href} className={`text-[11px] font-black uppercase tracking-widest transition-colors ${link.name === "Blog" ? "text-[#ff5528]" : "text-gray-500 hover:text-[#ff5528]"}`}>
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Search size={20} /></button>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#ff5528] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{itemCount}</span>
              )}
            </Link>
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/food" className="hidden lg:flex bg-[#ff5528] text-white px-7 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all">Order Now</Link>
          </div>
        </div>
      </header>

      {/* 3. BLOG HERO */}
      <section className="relative bg-[#0d0d0d] py-32 overflow-hidden">
        <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 0.3 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          <Image src={blog.avatar} alt={blog.title} fill className="object-cover" />
        </motion.div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
            <Link href="/blog" className="flex items-center gap-2 text-[#ff5528] font-black text-[11px] uppercase tracking-widest hover:gap-3 transition-all mb-6">
              <ArrowLeft size={14} /> Quay lại
            </Link>
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
            {blog.title}
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center gap-6 text-white/70 font-bold text-[11px] uppercase tracking-widest">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-[#ff5528]" /> {formatDate(blog.createdAt)}</span>
            <span className="flex items-center gap-2"><User size={16} className="text-[#ff5528]" /> {blog.author}</span>
            <span className="flex items-center gap-2"><MessageCircle size={16} className="text-[#ff5528]" /> {blog.reviewCount} Bình luận</span>
            <div className="flex items-center gap-2">
              <StarRating rating={blog.averageRating} size={16} />
              <span className="text-white">{blog.averageRating}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. BLOG CONTENT */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Featured Image */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="relative w-full h-96 rounded-4xl overflow-hidden shadow-xl mb-16">
            <Image src={blog.avatar} alt={blog.title} fill className="object-cover" />
          </motion.div>

          {/* Blog Meta Info */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-center justify-between mb-12 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
              <div>
                <p className="font-black text-sm uppercase text-[#0d0d0d]">{blog.author}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{blog.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Đánh giá</p>
              <div className="flex items-center gap-2 justify-end">
                <StarRating rating={blog.averageRating} size={18} />
                <span className="font-black text-lg text-[#ff5528]">{blog.averageRating}</span>
              </div>
            </div>
          </motion.div>

          {/* Blog Content */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-16">
            <div className="text-gray-700 leading-relaxed font-medium text-base space-y-6">
              {blog.content.split('\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                
                // Detect section headers (Bước, Kỹ thuật, etc.)
                const isHeader = /^(Bước|Kỹ thuật|Nguyên tắc|Thực đơn|Lưu ý)/.test(trimmed);
                const isListItem = /^\s*(-|•|\d+\.)/.test(paragraph);
                
                if (!trimmed) {
                  return <div key={idx} className="h-2" />;
                }
                
                if (isHeader) {
                  return (
                    <div key={idx} className="bg-linear-to-r from-[#ff5528]/5 to-transparent border-l-4 border-[#ff5528] pl-6 py-4 rounded-r">
                      <h3 className="text-lg font-black text-[#0d0d0d] uppercase tracking-tight mb-3">
                        {trimmed}
                      </h3>
                    </div>
                  );
                }
                
                if (isListItem) {
                  return (
                    <div key={idx} className="ml-6 flex gap-3">
                      <span className="text-[#ff5528] font-black shrink-0">•</span>
                      <p className="text-gray-700">{trimmed.replace(/^(-|•|\d+\.)/, '').trim()}</p>
                    </div>
                  );
                }
                
                return (
                  <p key={idx} className="text-gray-700 leading-relaxed">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="bg-[#ff5528] text-white p-12 rounded-2xl text-center mb-16">
            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Đặt hàng ngay</h3>
            <p className="mb-8 font-bold uppercase text-sm tracking-widest">Áp dụng công thức từ bài viết này vào thực đơn của bạn</p>
            <Link href="/food" className="inline-block bg-[#0d0d0d] text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#ffb936] hover:text-[#0d0d0d] transition-all">
              Xem thực đơn
            </Link>
          </motion.div>

          {/* Back to Blog Button */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex justify-center">
            <Link href="/blog" className="flex items-center gap-2 bg-white border-2 border-[#ff5528] text-[#ff5528] px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#ff5528] hover:text-white transition-all shadow-lg">
              <ArrowLeft size={16} /> Quay lại danh sách
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#0d0d0d] text-white pt-24 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#ff5528] rounded-full flex items-center justify-center font-black">FK</div>
                <span className="text-2xl font-black uppercase tracking-tighter">FoodKing</span>
              </div>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">Phục vụ những món ăn ngon nhất bằng tình yêu từ năm 1998.</p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#ff5528] transition-all"><Icon size={16} /></a>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-3 text-gray-500 text-sm font-bold">
                {NAV_LINKS.slice(0, 4).map(l => <li key={l.name}><Link href={l.href} className="hover:text-[#ff5528]">/ {l.name}</Link></li>)}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest">Giờ mở cửa</h4>
              <ul className="space-y-3 text-gray-400 text-xs font-bold uppercase">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>T2 - T6</span><span className="text-white">9:00 - 22:00</span></li>
                <li className="flex justify-between"><span>T7 - CN</span><span className="text-white">10:00 - 23:00</span></li>
              </ul>
            </div>

            <div className="space-y-6 text-sm font-medium text-gray-400">
              <h4 className="text-sm font-black uppercase tracking-widest text-white">Liên hệ</h4>
              <div className="flex gap-3"><MapPin size={18} className="text-[#ff5528]" /> 789 Pastry Lane, City</div>
              <div className="flex gap-3"><Phone size={18} className="text-[#ff5528]" /> +1 234 567 890</div>
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
