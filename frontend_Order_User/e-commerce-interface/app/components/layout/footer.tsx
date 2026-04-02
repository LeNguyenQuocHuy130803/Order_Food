'use client';

import Link from 'next/link';
import { Clock, Facebook, Instagram, MapPin, Phone, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
          <footer className="bg-[#0d0d0d] text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-[#ff5528] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">FK</span>
                </div>
                <span className="text-2xl font-bold">
                  Food<span className="text-[#ff5528]">King</span>
                </span>
              </Link>
              <p className="text-gray-400 mb-6">
                Serving delicious food with love since 1998. Quality ingredients, amazing taste.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ff5528] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ff5528] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ff5528] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ff5528] transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-[#ff5528] transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#ff5528] transition-colors">Our Menu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#ff5528] transition-colors">Special Offers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#ff5528] transition-colors">Gallery</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#ff5528] transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Opening Hours */}
            <div>
              <h4 className="text-xl font-bold mb-6">Opening Hours</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="text-white">9:00 - 22:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-white">10:00 - 23:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-white">11:00 - 21:00</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#ff5528] flex-shrink-0 mt-1" />
                  <span className="text-gray-400">789 Pastry Lane, Foodking City, FC 12345</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#ff5528]" />
                  <span className="text-gray-400">+1 234 567 890</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#ff5528]" />
                  <span className="text-gray-400">Open: 9:00 AM - 10:00 PM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FoodKing. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
  );
}
