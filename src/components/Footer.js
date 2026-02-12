"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

import { useSettingsStore } from "@/store/settingsStore";
import Image from "next/image";

export default function Footer() {
  const settings = useSettingsStore((state) => state.settings);
  return (
    <footer className="relative bg-surface mt-20 pt-20 pb-10 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="group flex items-center gap-3">
              {settings?.logo ? (
                  <div className="relative h-20 w-40">
                      <Image 
                          src={settings.logo} 
                          alt={settings.siteName || "Logo"} 
                          fill 
                          className="object-cover object-left"
                      />
                  </div>
              ) : (
                <>
                <div className="bg-gradient-to-br from-primary to-secondary w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">{settings?.siteName?.charAt(0) || "G"}</span>
                </div>
                <span className="text-2xl font-display font-bold tracking-tight text-gray-900 group-hover:text-primary transition-colors">
                    {settings?.siteName || "GRABSZY"}
                </span>
                </>
              )}
            </Link>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              Curating the finest contemporary fashion since 2024. Your destination for style, quality, and conscious living.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary hover:border-primary transition-all shadow-sm hover:shadow-lg hover:shadow-primary/30">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-display font-bold text-gray-900 mb-6 text-lg">Collections</h4>
            <ul className="space-y-4 text-gray-500 text-sm md:text-base">
              <li><Link href="/shop" className="hover:text-primary hover:translate-x-1 transition-all inline-block">New Arrivals</Link></li>
              <li><Link href="/shop" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Best Sellers</Link></li>
              <li><Link href="/shop" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Summer &apos;26</Link></li>
              <li><Link href="/shop" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Sustainable Line</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-display font-bold text-gray-900 mb-6 text-lg">Customer Care</h4>
            <ul className="space-y-4 text-gray-500 text-sm md:text-base">
              <li><Link href="/account/orders" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Track Order</Link></li>
              <li><Link href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Shipping Policy</Link></li>
              <li><Link href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-display font-bold text-gray-900 mb-6 text-lg">GRABSZY HQ</h4>
            <p className="text-gray-500 leading-relaxed mb-4 text-sm md:text-base">
              54/1 ottar Street Omalur<br />
              Salem, Tamil Nadu, 636455
            </p>
            <a href={`mailto:${settings?.supportEmail || "[EMAIL_ADDRESS]"}`} className="text-gray-900 font-bold underline decoration-primary decoration-2 underline-offset-4 hover:text-primary transition-colors">
              {settings?.supportEmail || "[EMAIL_ADDRESS]"}
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {settings?.siteName || "GRABSZY"}. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

