"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Clock, Users, Award, ChefHat, Utensils, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Menu, X, ShoppingCart, Search, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const menuItems = [
    { 
      name: "Home", 
      href: "/",
    },
        { 
      name: "Menu", 
      href: "/menu",
      dropdown: [
        { name: "Foods", href: "/menu#food" },
        { name: "Burgers", href: "/menu#burgers" },
        { name: "Pizza", href: "/menu#pizza" },
        { name: "Drinks", href: "/menu#drinks" },
      ]
    },
    { 
      name: "About", 
      href: "/about",
      dropdown: [
        { name: "Our Story", href: "/about#story" },
        { name: "Our Team", href: "/about#team" },
        { name: "Our Mission", href: "/about#mission" },
      ]
    },

    { 
      name: "Blog", 
      href: "/blog",
      dropdown: [
        { name: "Latest News", href: "/blog#latest" },
        { name: "Recipes", href: "/blog#recipes" },
        { name: "Tips & Tricks", href: "/blog#tips" },
      ]
    },
    { 
      name: "Contact", 
      href: "/contact",
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

            {/* Desktop Navigation with Dropdowns */}
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
                    className={`font-medium hover:text-[#ff5528] transition-colors flex items-center gap-1 ${item.name === "About" ? "text-[#ff5528]" : ""}`}
                  >
                    {item.name}
                    {item.dropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                  {item.dropdown && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border py-2 z-50">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-2 text-gray-700 hover:bg-[#ff5528] hover:text-white transition-colors"
                        >
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <div key={item.name}>
                    <Link href={item.href} className={`font-medium hover:text-[#ff5528] ${item.name === "About" ? "text-[#ff5528]" : ""}`}>
                      {item.name}
                    </Link>
                    {item.dropdown && (
                      <div className="ml-4 mt-2 flex flex-col gap-2">
                        {item.dropdown.map((subItem) => (
                          <Link key={subItem.name} href={subItem.href} className="text-gray-600 hover:text-[#ff5528]">
                            {subItem.name}
                          </Link>
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
          <Image src="/image/aboutus/banner_header.jpg" alt="Restaurant" fill className="object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Us</h1>
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Link href="/" className="hover:text-[#ff5528]">Home</Link>
            <span>/</span>
            <span className="text-[#ff5528]">About Us</span>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative w-full aspect-square max-w-lg">
                <Image src="/image/aboutus/banner_aboutus.jpg" alt="Our Story" fill className="object-cover rounded-3xl" />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-[#ff5528] text-white p-8 rounded-2xl shadow-2xl">
                <p className="text-5xl font-bold">25+</p>
                <p className="text-lg">Years Experience</p>
              </div>
            </div>
            <div className="space-y-6">
              <span className="text-[#ff5528] font-semibold text-lg">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0d0d0d]">The Best Tasty Food Restaurant</h2>
              <p className="text-gray-600 leading-relaxed">
                Founded in 1998, FoodKing started as a small family kitchen with a big dream - to serve the most delicious fried chicken in the city. Our founder, Chef Thomas King, perfected his secret recipe over 10 years of experimentation.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we have grown into a beloved restaurant chain with over 50 locations nationwide. But our commitment to quality, fresh ingredients, and family recipes remains unchanged.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#fff8f0] rounded-full flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-[#ff5528]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0d0d0d]">50+</p>
                    <p className="text-gray-500">Expert Chefs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#fff8f0] rounded-full flex items-center justify-center">
                    <Utensils className="w-8 h-8 text-[#ff5528]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0d0d0d]">150+</p>
                    <p className="text-gray-500">Menu Items</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#fff8f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#ff5528] font-semibold">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d0d0d] mt-2">Our Best Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Star, title: "Quality Food", desc: "We use only the freshest and highest quality ingredients" },
              { icon: Clock, title: "Fast Delivery", desc: "30 minutes delivery guarantee or your order is free" },
              { icon: Users, title: "Great Service", desc: "Our friendly staff ensures the best dining experience" },
              { icon: Award, title: "Award Winning", desc: "Voted best restaurant in the city 5 years in a row" },
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center group">
                <div className="w-20 h-20 bg-[#ff5528] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ffb936] transition-colors">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0d0d0d] mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#ff5528] font-semibold">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d0d0d] mt-2">Meet Our Expert Chefs</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Thomas King", role: "Founder & Head Chef", image: "/image/aboutus/chef1.jpg" },
              { name: "Maria Garcia", role: "Executive Chef", image: "/image/aboutus/chef2.jpg" },
              { name: "David Chen", role: "Pastry Chef", image: "/image/aboutus/chef3.jpg" },
              { name: "Huy LeNgQ", role: "King Chef", image: "/image/aboutus/chef4.JPG" },
            ].map((chef, index) => (
              <div key={index} className="group">
                <div className="relative h-80 rounded-2xl overflow-hidden mb-4">
                  <Image src={chef.image} alt={chef.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-3">
                      <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#ff5528] hover:text-white transition-colors">
                        <Facebook className="w-5 h-5" />
                      </a>
                      <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#ff5528] hover:text-white transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                      <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#ff5528] hover:text-white transition-colors">
                        <Instagram className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#0d0d0d] text-center">{chef.name}</h3>
                <p className="text-[#ff5528] text-center">{chef.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-20 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[#ff5528] font-semibold text-lg">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Delivering Happiness Through Food</h2>
              <p className="text-gray-400 leading-relaxed">
                Our mission is simple: to bring joy to every customer through delicious food, exceptional service, and a welcoming atmosphere. We believe that good food has the power to bring people together.
              </p>
              <ul className="space-y-4">
                {["Use only fresh, locally-sourced ingredients", "Maintain the highest food safety standards", "Provide fast and friendly service", "Give back to our community"].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-white">
                    <div className="w-6 h-6 bg-[#ff5528] rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <Image src="/image/aboutus/banner3.jpg" alt="Our Mission" width={600} height={500} className="rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] text-white pt-16 pb-8 border-t border-white/10">
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
