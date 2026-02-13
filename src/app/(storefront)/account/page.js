"use client";

import { useUserStore } from "@/store/userStore";
import { FiPackage, FiHeart, FiMapPin, FiCamera } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AccountOverview() {
  const { userInfo, login } = useUserStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading avatar...");
    setIsUploading(true);

    try {
        // 1. Upload to Cloudinary
        const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        
        if (!uploadRes.ok) throw new Error("Upload failed");
        
        const { url } = await uploadRes.json();

        // 2. Update User Profile
        const updateRes = await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: url }),
        });

        if (!updateRes.ok) throw new Error("Profile update failed");

        const updatedUser = await updateRes.json();
        
        // 3. Update Local State
        login(updatedUser, useUserStore.getState().token);
        
        toast.success("Avatar updated!", { id: toastId });
    } catch (error) {
        console.error(error);
        toast.error("Failed to update avatar", { id: toastId });
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Welcome Banner & Avatar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-gray-900/20">
        <div className="relative group shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 overflow-hidden relative bg-white/10">
                {userInfo?.image ? (
                    <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-primary text-white">
                        {userInfo?.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-xs font-bold">Change</span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                    />
                </label>
            </div>
            {isUploading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
        </div>
        
        <div className="relative z-10 text-center md:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {userInfo?.name}!</h2>
            <p className="text-gray-300 mb-6 max-w-lg mx-auto md:mx-0">
                Manage your profile, check your order status, and update your shipping information all in one place.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
                <Link href="/shop" className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-block shadow-lg">
                    Start Shopping
                </Link>
                <Link href="/account/orders" className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors inline-block">
                    View Orders
                </Link>
            </div>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/account/orders" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FiPackage size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Orders</h3>
            <p className="text-gray-500">Track, return, and buy things again</p>
        </Link>
        
        <Link href="/wishlist" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FiHeart size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Wishlist</h3>
            <p className="text-gray-500">Your favorite items saved for later</p>
        </Link>

        <Link href="/account/addresses" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FiMapPin size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Addresses</h3>
            <p className="text-gray-500">Manage shipping addresses</p>
        </Link>
      </div>
    </div>
  );
}
