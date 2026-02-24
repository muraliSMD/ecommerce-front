"use client";

import Link from "next/link";
import Image from "next/image";
import { FiPlus, FiArrowRight } from "react-icons/fi";

import { useSettingsStore } from "@/store/settingsStore";

export default function ProductCard({ product, onAddToCart }) {
  const hasVariants = product.variants && product.variants.length > 1;
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  return (
    <div className="group card-hover p-2 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden relative">
      {/* ... keeping existing JSX ... */}
      <Link href={`/product/${product.slug || product._id}`} className="block relative aspect-square overflow-hidden rounded-xl bg-surface">
        {product.videos?.length > 0 ? (
          <video
            src={product.videos[0]}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <Image
            src={product.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"}
            alt={product.name?.toString() || "Product"}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {product.discount && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter z-10">
            -{product.discount}%
          </span>
        )}
      </Link>

      <div className="p-2.5 space-y-1.5">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest truncate">
              {product.category?.name || (typeof product.category === 'string' && !product.category.match(/^[0-9a-fA-F]{24}$/) ? product.category : "Essentials")}
            </p>
            <h3 className="text-xs font-display font-bold text-gray-900 truncate" title={product.name}>{product.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-900 whitespace-nowrap">{formatPrice(product.price)}</p>
            {Number(product.mrp) > Number(product.price) && (
              <p className="text-[10px] text-gray-400 line-through">
                {formatPrice(product.mrp)}
              </p>
            )}
          </div>
        </div>

        {hasVariants ? (
          <Link href={`/product/${product.slug || product._id}`} className="mt-2 flex items-center justify-center gap-1.5 w-full bg-gray-900 text-white py-1.5 rounded-lg text-[10px] font-bold hover:bg-primary transition-all active:scale-95">
            Details <FiArrowRight size={10} />
          </Link>
        ) : (() => {
          const isOutOfStock = product.stock <= 0 || (product.variants?.length === 1 && product.variants[0].stock <= 0);
          return (
          <button
            disabled={isOutOfStock}
            className={`mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 shadow-sm border ${
              isOutOfStock 
                ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed" 
                : "bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary"
            }`}
            onClick={(e) => {
              e.preventDefault();
              const variant = product.variants?.length === 1 ? product.variants[0] : null;
              onAddToCart(product, 1, variant);
            }}
          >
            {isOutOfStock ? "Out of Stock" : <><FiPlus size={10} /> Add</>}
          </button>
          );
        })()}
      </div>
    </div>
  );
}

