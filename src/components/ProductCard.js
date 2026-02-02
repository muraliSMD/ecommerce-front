"use client";

import Link from "next/link";
import Image from "next/image";
import { FiPlus, FiArrowRight } from "react-icons/fi";

export default function ProductCard({ product, onAddToCart }) {
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="group card-hover p-3 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/50 overflow-hidden">
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-surface">
        <Image
          src={product.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"}
          alt={product.name.toString()}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {product.discount && (
          <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">
            -{product.discount}%
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{product.category || "Essentials"}</p>
            <h3 className="text-lg font-display font-bold text-gray-900 line-clamp-1">{product.name}</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">${product.price}</p>
        </div>

        {hasVariants ? (
          <Link href={`/product/${product._id}`} className="mt-4 flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3.5 rounded-2xl font-bold hover:bg-primary transition-all active:scale-95">
            View Details
            <FiArrowRight />
          </Link>
        ) : (
          <button
            className="mt-4 flex items-center justify-center gap-2 w-full bg-white text-gray-900 border border-gray-200 py-3.5 rounded-2xl font-bold hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-sm"
            onClick={() => onAddToCart(product)}
          >
            <FiPlus />
            Quick Add
          </button>
        )}
      </div>
    </div>
  );
}

