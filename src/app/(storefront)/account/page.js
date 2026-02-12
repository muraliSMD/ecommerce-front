"use client";

import { useUserStore } from "@/store/userStore";
import { FiPackage, FiHeart, FiMapPin } from "react-icons/fi";
import Link from "next/link";

export default function AccountOverview() {
  const { userInfo } = useUserStore();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/account/orders" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiPackage size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Orders</h3>
            <p className="text-gray-500 text-sm">Track and return orders</p>
        </Link>
        
        <Link href="/wishlist" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiHeart size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Wishlist</h3>
            <p className="text-gray-500 text-sm">Your favorite items</p>
        </Link>

        <Link href="/account/addresses" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiMapPin size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Addresses</h3>
            <p className="text-gray-500 text-sm">Manage shipping details</p>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {userInfo?.name}!</h2>
            <p className="text-gray-400 mb-6 max-w-lg">
                Manage your profile, check your order status, and update your shipping information all in one place.
            </p>
            <Link href="/shop" className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-block">
                Start Shopping
            </Link>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      </div>
    </div>
  );
}
