"use client";

import Link from "next/link";
import { FiHeart, FiUser, FiShoppingCart, FiSearch, FiLogOut } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const { userInfo, setAuthModalOpen, logout } = useUserStore();

  const cartCount = items?.filter((i) => i && i.quantity)
    .reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="glass sticky top-0 z-50 w-full overflow-hidden transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between p-4 md:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <div className="bg-primary group-hover:bg-secondary w-10 h-10 rounded-full flex items-center justify-center transition-colors">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-display font-bold tracking-tight text-gradient">
            STXRE
          </span>
        </Link>

        {/* Search */}
        <div className="relative hidden md:flex items-center w-1/3 group">
          <FiSearch className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search the latest trends..."
            className="w-full bg-surface/50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 px-12 py-2.5 rounded-2xl outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/wishlist" className="p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            <FiHeart size={22} />
          </Link>

          {userInfo ? (
            <div className="flex items-center gap-4">
              <span className="hidden lg:inline text-sm font-bold text-gray-900 border-r border-gray-100 pr-4">
                Hi, {userInfo.name.split(' ')[0]}
              </span>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
              >
                <FiLogOut size={22} />
              </button>
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
        </div>
      </div>
    </header>
  );
}

