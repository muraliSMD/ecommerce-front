"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import Link from "next/link";
import Image from "next/image";
import { FiTrash2, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

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
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
            <h1 className="text-4xl font-display font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-2">{items.length} items saved for later</p>
        </div>
        <button 
            onClick={clearWishlist}
            className="text-red-500 hover:text-red-600 font-medium underline underline-offset-4"
        >
            Clear Wishlist
        </button>
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
    </div>
  );
}
