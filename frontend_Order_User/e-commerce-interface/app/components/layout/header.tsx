"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ShoppingCart, Search, Phone, Mail, MapPin, Clock, ChevronDown, User } from "lucide-react"
import { Button } from "../ui/button"
import { SearchFilter } from "../search_filter"
import { useAuth } from "@/hooks/useAuth"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount] = useState(2)
  const [showSearch, setShowSearch] = useState(false)
  const [scrollOpacity, setScrollOpacity] = useState(1)
  const { user, loading, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = 300
      const opacity = Math.max(0.5, 1 - scrollY / maxScroll)
      setScrollOpacity(opacity)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Log user roles when user is loaded
  useEffect(() => {
    if (user && !loading) {
      console.log(`   - Roles: ${user.roles}`)
    }
  }, [user, loading])

  return (
    <header className="w-full relative">
      <SearchFilter showSearch={showSearch} setShowSearch={setShowSearch} />
      
      {/* Main Header */}
      <div 
        className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 transition-opacity duration-300"
        style={{ opacity: scrollOpacity }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 bg-[#ff5528] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-[#0d0d0d]">
                FOOD<span className="text-[#ff5528]">KING</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors flex items-center gap-1">
                Home
              </Link>
              <Link href="/food" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
                Food
              </Link>
              <Link href="/fresh" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
                Fresh
              </Link>
              <Link href="/drink" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
                Drink
              </Link>

              <Link href="#about" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
                About
              </Link>
              <div className="relative group">
                <button className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors flex items-center gap-1">
                  Pages <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <Link href="#" className="block px-4 py-3 hover:bg-[#ff5528] hover:text-white transition-colors">Our Chefs</Link>
                  <Link href="#" className="block px-4 py-3 hover:bg-[#ff5528] hover:text-white transition-colors">Gallery</Link>
                  <Link href="#" className="block px-4 py-3 hover:bg-[#ff5528] hover:text-white transition-colors">FAQ</Link>
                </div>
              </div>
              <Link href="#" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
                Contact
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3 pr-10">
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Avatar or Login Button */}
              {!loading && isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="relative w-10 h-10 rounded-full border-2 border-[#ff5528] overflow-hidden hover:border-[#e64a22] transition-colors flex items-center justify-center bg-gray-200"
                  >
                    <Image
                      src={user.avatar || '/image/avatarNull/avatarNull.jpg'}
                      alt={user.userName || 'User Avatar'}
                      fill
                      className="object-cover"
                      priority
                    />
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-52 bg-white shadow-2xl rounded-lg z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-semibold text-[#0d0d0d] truncate">{user.userName}</p>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </div>
                      {user.roles.includes('Customers') && (
                        <>
                          <Link
                            href="/account"
                            className="block px-4 py-3 hover:bg-[#f5f5f5] hover:text-[#ff5528] transition-colors text-sm"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Management Account
                          </Link>
                          <Link
                            href="/dashboard-employers"
                            className="block px-4 py-3 hover:bg-[#f5f5f5] hover:text-[#ff5528] transition-colors text-sm"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Dashboard
                          </Link>
                        </>
                      )}
                      <button
                        onClick={async () => {
                          setShowUserMenu(false)
                          await logout()
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition-colors border-t border-gray-200 text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login-page" className="hidden md:flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#f5f5f5] hover:bg-[#ff5528] hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-semibold">Login</span>
                </Link>
              )}

              <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#ff5528] text-white hover:bg-[#e64a22] transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ffb936] text-[#0d0d0d] text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] py-2">Home</Link>
                <Link href="#" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] py-2">Menu</Link>
                <Link href="#about" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] py-2">About</Link>
                <Link href="/drink" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] py-2">Drinks</Link>
                <Link href="#" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] py-2">Blog</Link>
                <Link href="#contact" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] py-2">Contact</Link>

              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
