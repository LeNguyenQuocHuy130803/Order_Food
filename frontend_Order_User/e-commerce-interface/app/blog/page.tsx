"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, User, MessageCircle, ArrowRight, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Menu, X, ShoppingCart, Search, ChevronDown, Calendar } from "lucide-react"
import { useState } from "react"

export default function BlogPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const menuItems = [
    { name: "Home", href: "/" },
    { 
      name: "About", href: "/about",
      dropdown: [
        { name: "Our Story", href: "/about#story" },
        { name: "Our Team", href: "/about#team" },
        { name: "Our Mission", href: "/about#mission" },
      ]
    },
    { 
      name: "Menu", href: "/menu",
      dropdown: [
        { name: "Fried Chicken", href: "/menu#chicken" },
        { name: "Burgers", href: "/menu#burgers" },
        { name: "Pizza", href: "/menu#pizza" },
      ]
    },
    { 
      name: "Blog", href: "/blog",
      dropdown: [
        { name: "Latest News", href: "/blog#latest" },
        { name: "Recipes", href: "/blog#recipes" },
        { name: "Tips & Tricks", href: "/blog#tips" },
      ]
    },
    { name: "Contact", href: "/contact" },
  ]

  const blogPosts = [
    {
      id: 1,
      title: "The Secret to Perfect Fried Chicken",
      excerpt: "Learn the techniques our chefs use to make the crispiest, juiciest fried chicken you've ever tasted.",
      image: "/image/blog/blog1.jpg",
      author: "Chef Thomas",
      date: "March 5, 2024",
      comments: 24,
      category: "Recipes"
    },
    {
      id: 2,
      title: "5 Burger Toppings You Need to Try",
      excerpt: "Take your burger game to the next level with these unique and delicious topping combinations.",
      image: "/image/blog/blog2.jpg",
      author: "Maria Garcia",
      date: "March 3, 2024",
      comments: 18,
      category: "Tips"
    },
    {
      id: 3,
      title: "New Location Opening in Downtown",
      excerpt: "We're excited to announce our newest restaurant location opening next month in the heart of downtown.",
      image: "/image/blog/blog3.jpg",
      author: "FoodKing Team",
      date: "March 1, 2024",
      comments: 45,
      category: "News"
    },
    {
      id: 4,
      title: "The Art of Making Perfect Pizza Dough",
      excerpt: "Master the basics of pizza dough with our step-by-step guide to achieving that perfect crust.",
      image: "/image/blog/blog4.jpg",
      author: "David Chen",
      date: "February 28, 2024",
      comments: 32,
      category: "Recipes"
    },
    {
      id: 5,
      title: "Healthy Fast Food: Is It Possible?",
      excerpt: "Discover how we're making fast food healthier without compromising on taste.",
      image: "/image/blog/blog5.jpg",
      author: "Sarah Wilson",
      date: "February 25, 2024",
      comments: 29,
      category: "Tips"
    },
    {
      id: 6,
      title: "Behind the Scenes: A Day in Our Kitchen",
      excerpt: "Take a peek behind the curtain and see what goes into preparing your favorite meals every day.",
      image: "/image/blog/blog6.jpg",
      author: "FoodKing Team",
      date: "February 22, 2024",
      comments: 15,
      category: "News"
    },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Bar */}
      <div className="bg-[#0d0d0d] text-white py-2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff5528]" />
              <span>789 Pastry Lane, Foodking City</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ff5528]" />
              <span>Open: 9:00 AM - 10:00 PM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#ff5528] transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#ff5528] transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#ff5528] transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#ff5528] transition-colors"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-[#ff5528] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">FK</span>
              </div>
              <span className="text-2xl font-bold text-[#0d0d0d]">Food<span className="text-[#ff5528]">King</span></span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {menuItems.map((item) => (
                <div 
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link 
                    href={item.href} 
                    className={`font-medium hover:text-[#ff5528] transition-colors flex items-center gap-1 ${item.name === "Blog" ? "text-[#ff5528]" : ""}`}
                  >
                    {item.name}
                    {item.dropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                  {item.dropdown && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border py-2 z-50">
                      {item.dropdown.map((subItem) => (
                        <Link key={subItem.name} href={subItem.href} className="block px-4 py-2 text-gray-700 hover:bg-[#ff5528] hover:text-white transition-colors">
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Search className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#ff5528] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </button>
              <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button className="hidden lg:flex items-center gap-2 bg-[#ff5528] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#e04420] transition-colors">
                <Phone className="w-4 h-4" /> Order Now
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <div key={item.name}>
                    <Link href={item.href} className={`font-medium hover:text-[#ff5528] ${item.name === "Blog" ? "text-[#ff5528]" : ""}`}>
                      {item.name}
                    </Link>
                    {item.dropdown && (
                      <div className="ml-4 mt-2 flex flex-col gap-2">
                        {item.dropdown.map((subItem) => (
                          <Link key={subItem.name} href={subItem.href} className="text-gray-600 hover:text-[#ff5528]">{subItem.name}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Page Banner */}
      <section className="relative bg-[#0d0d0d] py-20">
        <div className="absolute inset-0 opacity-30">
          <Image src="/image/blog/bannerblog.jpg" alt="Blog" fill className="object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Blog</h1>
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Link href="/" className="hover:text-[#ff5528]">Home</Link>
            <span>/</span>
            <span className="text-[#ff5528]">Blog</span>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section id="latest" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#ff5528] font-semibold">Latest News</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d0d0d] mt-2">From Our Blog</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="relative h-56 overflow-hidden">
                  <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-4 left-4 bg-[#ff5528] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments} Comments
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0d0d0d] mb-3 group-hover:text-[#ff5528] transition-colors">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#ff5528]" />
                      <span className="text-sm text-gray-500">{post.author}</span>
                    </div>
                    <Link href={`/blog/${post.id}`} className="flex items-center gap-1 text-[#ff5528] font-semibold hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-12">
            <button className="w-10 h-10 bg-[#ff5528] text-white rounded-full font-semibold">1</button>
            <button className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-[#ff5528] hover:text-white transition-colors">2</button>
            <button className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-[#ff5528] hover:text-white transition-colors">3</button>
            <button className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-[#ff5528] hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-[#ff5528]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">Get the latest recipes, news, and special offers delivered straight to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto text-white">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffb936]"
            />
            <button type="submit" className="bg-[#0d0d0d] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#ffb936] transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-[#ff5528] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">FK</span>
                </div>
                <span className="text-2xl font-bold">Food<span className="text-[#ff5528]">King</span></span>
              </Link>
              <p className="text-gray-400 mb-6">Serving delicious food with love since 1998.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ff5528] transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ff5528] transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ff5528] transition-colors"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-[#ff5528]">About Us</Link></li>
                <li><Link href="/menu" className="text-gray-400 hover:text-[#ff5528]">Our Menu</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-[#ff5528]">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-[#ff5528]">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Opening Hours</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex justify-between"><span>Mon - Fri</span><span className="text-white">9:00 - 22:00</span></li>
                <li className="flex justify-between"><span>Saturday</span><span className="text-white">10:00 - 23:00</span></li>
                <li className="flex justify-between"><span>Sunday</span><span className="text-white">11:00 - 21:00</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-[#ff5528] flex-shrink-0 mt-1" /><span className="text-gray-400">789 Pastry Lane, Foodking City</span></li>
                <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-[#ff5528]" /><span className="text-gray-400">+1 234 567 890</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>2024 FoodKing. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
