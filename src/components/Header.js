"use client";

import Link from "next/link";
import { FiHeart, FiUser, FiShoppingCart } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";

export default function Header() {
  const items = useCartStore((state) => state.items);

  // ✅ Safely calculate cart count
  const cartCount = items?.filter((i) => i && i.quantity)
    .reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold text-yellow-700">
          ✨ GoldStore
        </Link>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="border px-4 py-2 rounded-lg w-1/3 hidden md:block"
        />

        <div className="flex items-center gap-4">
          {/* Wishlist icon */}
          <Link href="/wishlist" className="relative text-gray-700 hover:text-yellow-700">
            <FiHeart size={24} />
          </Link>

          {/* Login icon */}
          <Link href="/auth/login" className="relative text-gray-700 hover:text-yellow-700">
            <FiUser size={24} />
          </Link>

          {/* Cart icon */}
          <Link
            href="/cart"
            className="relative bg-yellow-700 text-white px-4 py-2 rounded-xl"
          >
            <FiShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
