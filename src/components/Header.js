"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHeart, FiUser, FiShoppingCart, FiSearch, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { userInfo, setAuthModalOpen, logout } = useUserStore();

  const cartCount = items?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
       router.push(`/shop?search=${e.target.value}`);
    }
  };

  return (
    <header className="glass sticky top-0 z-50 w-full overflow-hidden transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between p-4 md:px-8">
        <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
            <div className="bg-primary group-hover:bg-secondary w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-gradient">
                GRABSZY
            </span>
            </Link>
            
            <nav className="hidden md:flex gap-6">
                <Link href="/shop" className="text-gray-600 font-bold hover:text-primary transition-colors">Shop</Link>
                <Link href="/shop?category=Men" className="text-gray-500 hover:text-primary transition-colors">Men</Link>
                <Link href="/shop?category=Women" className="text-gray-500 hover:text-primary transition-colors">Women</Link>
            </nav>
        </div>

        {/* Search */}
        <div className="relative hidden md:flex items-center w-1/3 group">
          <FiSearch className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search the latest trends..."
            onKeyDown={handleSearch}
            className="w-full bg-surface/50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 px-12 py-2.5 rounded-2xl outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/wishlist" className="p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all relative">
            <FiHeart size={22} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
            {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </Link>

          {userInfo ? (
            <div className="relative group">
              <Link href="/account" className="flex items-center gap-3 hover:bg-gray-50 p-2 pr-4 rounded-full transition-all">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                  {userInfo.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-gray-900 leading-none">{userInfo.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-500 font-medium">My Account</p>
                </div>
              </Link>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                <div className="w-64 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden p-2">
                  <div className="px-4 py-3 border-b border-gray-50 mb-2">
                    <p className="font-bold text-gray-900">{userInfo.name}</p>
                    <p className="text-xs text-gray-400 truncate">{userInfo.email}</p>
                  </div>
                  
                  <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors font-medium text-sm">
                    <FiUser size={18} /> Overview
                  </Link>
                  <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors font-medium text-sm">
                    <FiShoppingCart size={18} /> My Orders
                  </Link>
                  
                  <div className="h-px bg-gray-50 my-2" />
                  
                  <button 
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
                  >
                    <FiLogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true, "login")}
              className="p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
            >
              <FiUser size={22} />
            </button>
          )}

          <Link
            href="/cart"
            className="relative flex items-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <FiShoppingCart size={20} />
            <span className="hidden sm:inline font-medium text-sm">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 border-2 border-white rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
                <div className="p-6 space-y-6">
                    {/* Mobile Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            onKeyDown={(e) => {
                                handleSearch(e);
                                if(e.key === 'Enter') setIsMobileMenuOpen(false);
                            }}
                            className="w-full bg-gray-50 border border-gray-100 focus:border-primary px-12 py-3 rounded-xl outline-none"
                        />
                    </div>
                    
                    <nav className="flex flex-col gap-4">
                        <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Shop All</Link>
                        <Link href="/shop?category=Men" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-500 hover:text-primary pb-2">Men</Link>
                        <Link href="/shop?category=Women" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-500 hover:text-primary pb-2">Women</Link>
                        <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-500 hover:text-primary pb-2 flex items-center gap-2"><FiHeart /> Wishlist</Link>
                    </nav>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

