"use client"

import { useState, useEffect, useCallback, useRef, type RefObject } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ShoppingCart, Search, User, LogOut, LayoutDashboard, Settings } from "lucide-react"
import { SearchFilter } from "../search_filter"
import { useAuth } from "@/hooks/useAuth"
import { useUserDetail } from "@/lib/api/queries"
import { useCartQuery } from "@/hooks/useCartQuery"
import type { AuthUser, UserDetail } from "@/types/user"

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Food", href: "/food" },
  { name: "Fresh", href: "/fresh" },
  { name: "Drink", href: "/drink" },
  { name: "Dessert", href: "/dessert" },
  { name: "Blog", href: "/blog" },
  { name: "About us", href: "/about_us" },
  { name: "Contact", href: "/contact" },
];

const DEFAULT_AVATAR = '/image/avatarNull/avatarNull.jpg';

function useOutsideClick(ref: RefObject<HTMLElement | null>, callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

interface UserMenuDropdownProps {
  profile?: UserDetail;
  user: AuthUser;
  avatarSrc: string;
  onLogout: () => Promise<void>;
  onClose: () => void;
}

function UserMenuDropdown({ profile, user, avatarSrc, onLogout, onClose }: UserMenuDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, onClose);

  const isCustomer = user.roles?.includes('CUSTOMER');

  return (
    <div ref={dropdownRef} className="absolute right-0 top-14 w-64 bg-white shadow-2xl rounded-2xl z-50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-5 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
          <Image src={avatarSrc} alt="Avatar" fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0d0d0d] truncate text-sm">{profile?.userName || user.userName}</p>
          <p className="text-[10px] text-gray-500 truncate font-medium uppercase tracking-tight">{profile?.email || user.email}</p>
        </div>
      </div>

      <div className="py-2">
        {isCustomer && (
          <>
            <Link href="/account" className="flex items-center gap-3 px-5 py-3 hover:bg-[#f5f5f5] hover:text-[#ff5528] transition-colors text-sm font-medium text-gray-700" onClick={onClose}>
              <Settings size={18} className="text-gray-400" /> Management Account
            </Link>
            <Link href="/dashboard-employers" className="flex items-center gap-3 px-5 py-3 hover:bg-[#f5f5f5] hover:text-[#ff5528] transition-colors text-sm font-medium text-gray-700" onClick={onClose}>
              <LayoutDashboard size={18} className="text-gray-400" /> Dashboard
            </Link>
          </>
        )}
      </div>

      <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 text-red-600 transition-colors border-t border-gray-100 text-sm font-bold">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [scrollOpacity, setScrollOpacity] = useState(1)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [avatarRefresh, setAvatarRefresh] = useState(0)

  const { user, loading, isAuthenticated, logout } = useAuth()
  const { data: profile } = useUserDetail(user?.id ?? 0, isAuthenticated)
  const { itemCount } = useCartQuery(isAuthenticated)

  useEffect(() => {
    const handleScroll = () => {
      const opacity = Math.max(0.7, 1 - window.scrollY / 300)
      setScrollOpacity(opacity)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkAvatarUpdate = () => {
      if (document.visibilityState === 'visible') setAvatarRefresh(prev => prev + 1)
    }
    window.addEventListener('visibilitychange', checkAvatarUpdate)
    return () => window.removeEventListener('visibilitychange', checkAvatarUpdate)
  }, [])

  const handleLogout = useCallback(async () => {
    setShowUserMenu(false);
    await logout();
  }, [logout]);

  // ✅ Tối ưu logic lấy ảnh để tránh lỗi query string trên local path
  const getAvatarSrc = () => {
    const baseSrc = profile?.avatar || user?.avatar || DEFAULT_AVATAR;
    // Nếu là ảnh từ server (http...) thì mới thêm query string để tránh lỗi localPatterns của Next.js
    if (baseSrc.startsWith('http')) {
      return `${baseSrc}?v=${avatarRefresh}`;
    }
    return baseSrc; // Ảnh local (/image/...) giữ nguyên
  };

  const currentAvatar = getAvatarSrc();

  return (
    <header className="w-full relative">
      <SearchFilter showSearch={showSearch} setShowSearch={setShowSearch} />

      <div
        className="bg-white/95 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-100"
        style={{ opacity: scrollOpacity }}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-[#ff5528] rounded-full flex items-center justify-center transition-transform group-hover:rotate-12">
              <span className="text-white font-black text-2xl">F</span>
            </div>
            <span className="text-2xl font-black text-[#0d0d0d] tracking-tighter uppercase">
              FOOD<span className="text-[#ff5528]">KING</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-bold text-xs hover:text-[#ff5528] transition-colors uppercase tracking-widest text-gray-700">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowSearch(!showSearch)} className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors active:scale-90" aria-label="Search">
              <Search size={20} />
            </button>

            {!loading && isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(prev => !prev)}
                  className="relative w-11 h-11 rounded-full border-2 border-[#ff5528] overflow-hidden hover:border-[#e64a22] transition-all bg-gray-100 shadow-inner active:scale-95"
                >
                  <Image src={currentAvatar} alt="User" fill className="object-cover" priority />
                </button>

                {showUserMenu && (
                  <UserMenuDropdown
                    profile={profile}
                    user={user}
                    avatarSrc={currentAvatar}
                    onLogout={handleLogout}
                    onClose={() => setShowUserMenu(false)}
                  />
                )}
              </div>
            ) : (
              <Link href="/login-page" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f5f5f5] font-black text-xs uppercase tracking-widest hover:bg-[#ff5528] hover:text-white transition-all active:scale-95">
                <User size={18} /> Login
              </Link>
            )}

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

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-gray-900 active:scale-90 transition-transform">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 p-6 flex flex-col gap-2 animate-in slide-in-from-top duration-300">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-bold py-3 border-b border-gray-50 last:border-none uppercase text-xs tracking-widest text-gray-700" onClick={() => setIsMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
