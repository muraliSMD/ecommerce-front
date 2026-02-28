"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiShoppingCart, FiHeart, FiArrowLeft } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/Skeleton";

export default function PublicWishlistPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`/api/wishlist/${id}`);
        const d = await res.json();
        if (res.ok) {
          setData(d);
        } else {
          toast.error(d.message || "Wishlist not found");
        }
      } catch (error) {
        toast.error("Error loading wishlist");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [id]);

  const handleAddToCart = (product) => {
    addItemToCart(product, 1);
    toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-8 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] rounded-xl" />
                    <Skeleton className="h-6 w-full rounded-md" />
                    <Skeleton className="h-6 w-1/3 rounded-md" />
                </div>
            ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
        <h1 className="text-3xl font-display font-bold text-gray-900">Wishlist Not Found</h1>
        <p className="text-gray-500">This wishlist may have been deleted or the link is incorrect.</p>
        <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-xl font-bold">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
      <Link href="/shop" className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold mb-8 transition-colors">
        <FiArrowLeft /> Back to Shop
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-gray-900">{data.name}&apos;s Wishlist</h1>
        <p className="text-gray-500 mt-2">Checking out what {data.name} loves on GRABSZY</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.wishlist.map((product) => (
          <div key={product._id} className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all border border-gray-100 relative">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                <Image
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
