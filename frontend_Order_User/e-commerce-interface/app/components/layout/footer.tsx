'use client';

import Link from 'next/link';
import { 
  Facebook, Instagram, MapPin,
  Phone, Twitter, Youtube, Mail, ChevronRight 
} from 'lucide-react';

// --- Khai báo dữ liệu để code sạch hơn ---
const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

const QUICK_LINKS = [
  { name: 'Về chúng tôi', href: '/about' },
  { name: 'Thực đơn', href: '/food' },
  { name: 'Ưu đãi đặc biệt', href: '/offers' },
  { name: 'Tin tức ẩm thực', href: '/blog' },
  { name: 'Liên hệ', href: '/contact' },
];

const OPENING_HOURS = [
  { days: 'Thứ 2 - Thứ 6', time: '09:00 - 22:00' },
  { days: 'Thứ 7', time: '10:00 - 23:00' },
  { days: 'Chủ nhật', time: '11:00 - 21:00' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d0d0d] text-white border-t border-white/5">
      <div className="container mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* CỘT 1: THƯƠNG HIỆU */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[#ff5528] rounded-full flex items-center justify-center transition-transform group-hover:rotate-12">
                <span className="text-white font-black text-xl">FK</span>
              </div>
              <span className="text-2xl font-black tracking-tighter">
                Food<span className="text-[#ff5528]">King</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Tự hào phục vụ những món ăn ngon nhất từ năm 1998. Chúng tôi cam kết sử dụng nguyên liệu sạch và mang lại trải nghiệm ẩm thực tuyệt vời.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#ff5528] hover:text-white text-gray-400 transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* CỘT 2: LIÊN KẾT NHANH */}
          <div>
            <h4 className="text-lg font-bold mb-7 relative inline-block">
              Liên kết nhanh
              <span className="absolute -bottom-2 left-0 w-10 h-1 bg-[#ff5528]"></span>
            </h4>
            <ul className="space-y-4">
              {QUICK_LINKS.map((link, idx) => (
                <li key={idx}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-[#ff5528] flex items-center gap-2 text-sm transition-colors group"
                  >
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: GIỜ MỞ CỬA */}
          <div>
            <h4 className="text-lg font-bold mb-7 relative inline-block">
              Giờ mở cửa
              <span className="absolute -bottom-2 left-0 w-10 h-1 bg-[#ff5528]"></span>
            </h4>
            <ul className="space-y-4">
              {OPENING_HOURS.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                  <span className="text-gray-400">{item.days}</span>
                  <span className="text-[#ff5528] font-bold">{item.time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-[#ff5528]/10 border border-[#ff5528]/20 rounded-xl">
              <p className="text-xs text-[#ff5528] font-bold uppercase tracking-widest text-center">
                Mở cửa cả ngày lễ
              </p>
            </div>
          </div>

          {/* CỘT 4: THÔNG TIN LIÊN HỆ */}
          <div>
            <h4 className="text-lg font-bold mb-7 relative inline-block">
              Thông tin liên hệ
              <span className="absolute -bottom-2 left-0 w-10 h-1 bg-[#ff5528]"></span>
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#ff5528]/20 transition-colors">
                  <MapPin size={18} className="text-[#ff5528]" />
                </div>
                <span className="text-gray-400 text-sm leading-snug">
                  789 Pastry Lane, Foodking City, FC 12345
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#ff5528]/20 transition-colors">
                  <Phone size={18} className="text-[#ff5528]" />
                </div>
                <a href="tel:+1234567890" className="text-gray-400 hover:text-[#ff5528] text-sm font-bold transition-colors">
                  +84 76 523 3951
                </a>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#ff5528]/20 transition-colors">
                  <Mail size={18} className="text-[#ff5528]" />
                </div>
                <a href="mailto:info@foodking.com" className="text-gray-400 hover:text-[#ff5528] text-sm transition-colors">
                  huylnq318030@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
            &copy; {currentYear} <span className="text-white">FoodKing</span>. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
