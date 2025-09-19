"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-10 py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div>
          <h3 className="text-xl font-bold text-yellow-700">GoldStore</h3>
          <p className="text-gray-600 mt-2">Exquisite jewellery crafted with love.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-gray-600">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/category/rings">Rings</Link></li>
            <li><Link href="/category/necklaces">Necklaces</Link></li>
            <li><Link href="/cart">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Follow Us</h4>
          <div className="flex justify-center md:justify-start space-x-4">
            <a href="#"><Facebook className="text-gray-600 hover:text-yellow-700" /></a>
            <a href="#"><Instagram className="text-gray-600 hover:text-yellow-700" /></a>
            <a href="#"><Twitter className="text-gray-600 hover:text-yellow-700" /></a>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        © {new Date().getFullYear()} GoldStore. All rights reserved.
      </p>
    </footer>
  );
}
