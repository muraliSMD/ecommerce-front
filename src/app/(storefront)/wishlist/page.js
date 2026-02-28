"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import Link from "next/link";
import Image from "next/image";
import { FiTrash2, FiShoppingCart, FiHeart, FiShare2, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const [shareId, setShareId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);

  const handleShare = async () => {
    setLoadingShare(true);
    try {
      const res = await fetch("/api/user/wishlist/share", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setShareId(data.shareId);
        setShowShareModal(true);
      } else {
        toast.error("Failed to generate share link");
      }
    } catch (error) {
      toast.error("Error sharing wishlist");
    } finally {
      setLoadingShare(false);
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/wishlist/share/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = (product) => {
    addItemToCart(product, 1);
    toast.success("Added to cart!");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <FiHeart size={40} />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Your Wishlist is Empty</h1>
        <p className="text-gray-500 max-w-md">
          Looks like you haven&apos;t saved any items yet. Browse our shop and find something you love!
        </p>
        <Link 
            href="/shop"
            className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
        >
            Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-12 min-h-screen">
      <div className="mb-4">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Wishlist", href: "/wishlist" },
        ]} />
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
            <h1 className="text-4xl font-display font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-2">{items.length} items saved for later</p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={handleShare}
                disabled={loadingShare}
                className="flex items-center gap-2 bg-primary/10 text-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary/20 transition-all disabled:opacity-50"
            >
                <FiShare2 /> {loadingShare ? "Generating..." : "Share Wishlist"}
            </button>
            <button 
                onClick={clearWishlist}
                className="text-red-500 hover:text-red-600 font-medium underline underline-offset-4"
            >
                Clear Wishlist
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((product) => (
          <div key={product._id} className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all border border-gray-100 relative">
            
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                <Image
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                 <button 
                    onClick={() => removeItem(product._id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white transition-colors z-10"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>

            <div className="space-y-2">
                <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                <p className="text-primary font-bold">${product.price}</p>
                
                <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                    <FiShoppingCart size={18} /> Add to Cart
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={() => setShowShareModal(false)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiX size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                        <FiShare2 size={32} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-gray-900">Share Wishlist</h3>
                    <p className="text-gray-500 text-sm mt-2">Anyone with this link can view your wishlist items.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 mb-6">
                    <input 
                        type="text" 
                        readOnly 
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/wishlist/share/${shareId}`}
                        className="bg-transparent border-none outline-none text-sm text-gray-600 flex-1 font-mono"
                    />
                    <button 
                        onClick={handleCopy}
                        className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-all active:scale-90"
                    >
                        {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                    </button>
                </div>

                <button 
                    onClick={() => setShowShareModal(false)}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
                >
                    Done
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
