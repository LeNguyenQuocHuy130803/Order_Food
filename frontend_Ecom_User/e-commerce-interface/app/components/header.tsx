"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart, Search, Phone, Mail, MapPin, Clock, ChevronDown, User } from "lucide-react"
import { Button } from "../components/ui/button"
import { SearchFilter } from "./search_filter"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount] = useState(2)
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="w-full relative">
      <SearchFilter showSearch={showSearch} setShowSearch={setShowSearch} />
      
      {/* Main Header */}
      <div className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
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
              <Link href="#about" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
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
            <div className="flex items-center gap-1 pr-10">
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-5 h-5" />
              </button>
              <Link href="/login-page" className="hidden md:flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#f5f5f5] hover:bg-[#ff5528] hover:text-white transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm font-semibold">Đăng nhập</span>
              </Link>
              <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#ff5528] text-white">
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
