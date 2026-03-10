"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, Phone, MapPin, Mail, Facebook, Twitter, Instagram, Youtube, Menu, X, ShoppingCart, Search, ChevronDown, Send } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Bar */}
      <div className="bg-[#0d0d0d] text-white py-2">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center text-sm">
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
        <div className="container mx-auto px-4 py-4">
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
                    className={`font-medium hover:text-[#ff5528] transition-colors flex items-center gap-1 ${item.name === "Contact" ? "text-[#ff5528]" : ""}`}
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
                    <Link href={item.href} className={`font-medium hover:text-[#ff5528] ${item.name === "Contact" ? "text-[#ff5528]" : ""}`}>
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
          <Image src="/image/imagecontact.jpg" alt="Contact" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Link href="/" className="hover:text-[#ff5528]">Home</Link>
            <span>/</span>
            <span className="text-[#ff5528]">Contact</span>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-32 relative z-20">
            {[
              { icon: MapPin, title: "Our Location", info: "789 Pastry Lane, Foodking City, FC 12345", color: "bg-[#ff5528]" },
              { icon: Phone, title: "Phone Number", info: "+1 234 567 890\n+1 234 567 891", color: "bg-[#ffb936]" },
              { icon: Mail, title: "Email Address", info: "info@foodking.com\nsupport@foodking.com", color: "bg-[#ff5528]" },
              { icon: Clock, title: "Working Hours", info: "Mon-Fri: 9AM - 10PM\nSat-Sun: 10AM - 11PM", color: "bg-[#ffb936]" },
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-xl text-center hover:shadow-2xl transition-shadow">
                <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0d0d0d] mb-3">{item.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">{item.info}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-[#fff8f0]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl">
              <span className="text-[#ff5528] font-semibold">Get In Touch</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0d0d0d] mt-2 mb-8">Send Us a Message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5528] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5528] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+1 234 567 890"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5528] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input 
                      type="text" 
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5528] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                  <textarea 
                    rows={5}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5528] focus:border-transparent resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#ff5528] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#e04420] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096949687927!2d105.84315831540235!3d21.028511293115547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2sHoan%20Kiem%20Lake!5e0!3m2!1sen!2s!4v1621234567890!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "350px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#ff5528] font-semibold text-lg">Book a Table</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6">Make a Reservation</h2>
              <p className="text-gray-400 mb-8">Reserve your table online and enjoy a special dining experience with your family and friends.</p>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5528]"
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5528]"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff5528]"
                  />
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff5528]"
                  />
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff5528]">
                    <option value="" className="text-gray-900">Guests</option>
                    <option value="1" className="text-gray-900">1 Person</option>
                    <option value="2" className="text-gray-900">2 People</option>
                    <option value="3" className="text-gray-900">3 People</option>
                    <option value="4" className="text-gray-900">4 People</option>
                    <option value="5" className="text-gray-900">5+ People</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="w-full md:w-auto bg-[#ff5528] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#ffb936] transition-colors"
                >
                  Book a Table
                </button>
              </form>
            </div>
            <div className="relative hidden lg:block">
              <Image 
                src="/image/imagecontact2.jpg" 
                alt="Restaurant Interior" 
                width={600} 
                height={500} 
                className="rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] text-white pt-16 pb-8 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-7xl">
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
