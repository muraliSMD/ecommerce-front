"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-gray-200 pt-20 pb-10 mt-20">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-display font-bold tracking-tight">STXRE</span>
            </Link>
            <p className="text-gray-500 leading-relaxed">
              Curating the finest contemporary fashion since 2024. Your destination for style, quality, and conscious living.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-gray-900 mb-6">Collections</h4>
            <ul className="space-y-4 text-gray-500">
              <li><Link href="#" className="hover:text-primary transition-colors">New Arrivals</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Best Sellers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Summer '26</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Sustainable Line</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-gray-900 mb-6">Customer Care</h4>
            <ul className="space-y-4 text-gray-500">
              <li><Link href="#" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-gray-900 mb-6">STXRE HQ</h4>
            <p className="text-gray-500 leading-relaxed mb-4">
              Fashion District, 452 Fifth Avenue<br />
              New York, NY 10018
            </p>
            <p className="text-gray-900 font-bold underline decoration-primary decoration-2 underline-offset-4 cursor-pointer">
              hello@stxre.com
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} STXRE. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

