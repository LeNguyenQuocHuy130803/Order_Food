"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, Menu, X, Search, User } from "lucide-react"
import { Button } from "@/app/components/ui/button"

export function ProductHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
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
          <Link href="/" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
            Home
          </Link>
          <Link href="/food" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
            Food
          </Link>
          <Link href="/fresh" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
            Fresh
          </Link>
          <Link href="/drink" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
            Drinks
          </Link>
          <Link href="/dessert" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
            Dessert
          </Link>
          <Link href="/blog" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
            Blog
          </Link>
          <Link href="/contact" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
            Contact
          </Link>
          <Link href="/about" className="font-semibold text-[#0d0d0d] hover:text-[#ff5528] transition-colors">
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5528] text-xs text-white font-bold">
                3
              </span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border">
          <div className="space-y-1 px-4 py-4">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-base font-medium text-[#0d0d0d] hover:bg-muted hover:text-[#ff5528]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/food"
              className="block rounded-lg px-3 py-2 text-base font-medium text-[#0d0d0d] hover:bg-muted hover:text-[#ff5528]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Food
            </Link>
            <Link
              href="/fresh"
              className="block rounded-lg px-3 py-2 text-base font-medium text-[#0d0d0d] hover:bg-muted hover:text-[#ff5528]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fresh
            </Link>
            <Link
              href="/drink"
              className="block rounded-lg px-3 py-2 text-base font-medium text-[#0d0d0d] hover:bg-muted hover:text-[#ff5528]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Drinks
            </Link>
            <Link
              href="/dessert"
              className="block rounded-lg px-3 py-2 text-base font-medium text-[#0d0d0d] hover:bg-muted hover:text-[#ff5528]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Desserts
            </Link>
            <Link
              href="/blog"
              className="block rounded-lg px-3 py-2 text-base font-medium text-[#0d0d0d] hover:bg-muted hover:text-[#ff5528]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="block rounded-lg px-3 py-2 text-base font-medium text-[#0d0d0d] hover:bg-muted hover:text-[#ff5528]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/about"
              className="block rounded-lg px-3 py-2 text-base font-medium text-[#0d0d0d] hover:bg-muted hover:text-[#ff5528]"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
