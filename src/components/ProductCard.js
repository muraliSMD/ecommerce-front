"use client";

import Link from "next/link";
import Image from "next/image";
import { FiPlus, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";

import { useSettingsStore } from "@/store/settingsStore";

export default function ProductCard({ product, onAddToCart, priority = false }) {
  const hasVariants = product.variants && product.variants.length > 1;
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const router = useRouter();

  return (
    <div className="group card-hover p-2 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden relative h-full flex flex-col">
      {/* ... keeping existing JSX ... */}
      <Link href={`/product/${product.slug || product._id}`} className="block relative aspect-square overflow-hidden rounded-xl bg-surface">
        {product.videos?.filter(v => typeof v === 'string' && v.trim() !== '').length > 0 ? (
          <video
            src={product.videos.filter(v => typeof v === 'string' && v.trim() !== '')[0]}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <Image
            src={product.images?.filter(i => typeof i === 'string' && i.trim() !== '')?.[0] || product.variants?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"}
            alt={`${product.name} - ${product.category?.name || "Essentials"} | GRABSZY`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={priority}
          />
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {product.discount && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter z-10">
            -{product.discount}%
          </span>
        )}

        {((hasVariants ? product.variants.every(v => v.stock <= 0 && !v.isPreBook) : (product.stock <= 0 && !product.isPreBook)) && !product.isPreBook) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">Out of Stock</span>
            </div>
          </div>
        )}

        {/* Pre-book Badge */}
        {(product.isPreBook || (hasVariants ? product.variants.some(v => v.isPreBook) : false)) && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-primary/90 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-lg">
              <span className="text-white text-[9px] font-bold uppercase tracking-wider">Pre-book</span>
            </div>
          </div>
        )}
      </Link>

      <div className="p-2.5 flex flex-col justify-between flex-grow gap-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest truncate">
              {product.category?.name || (typeof product.category === 'string' && !product.category.match(/^[0-9a-fA-F]{24}$/) ? product.category : "Essentials")}
            </p>
            <h3 className="text-xs font-display font-bold text-text-main truncate" title={product.name}>{product.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-text-main whitespace-nowrap">{formatPrice(product.price)}</p>
            {Number(product.mrp) > Number(product.price) && (
              <p className="text-[10px] text-text-muted line-through">
                {formatPrice(product.mrp)}
              </p>
            )}
          </div>
        </div>

        {hasVariants ? (
          <Link 
            href={`/product/${product.slug || product._id}`} 
            className={`mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
              product.variants.every(v => v.stock <= 0 && !v.isPreBook)
                ? "bg-gray-100 text-text-muted border border-gray-100 cursor-not-allowed"
                : "bg-btn-dark text-btn-text hover:bg-btn-dark-hover"
            }`}
          >
            {product.variants.every(v => v.stock <= 0 && !v.isPreBook) && !product.isPreBook 
              ? "Out of Stock" 
              : (product.isPreBook || product.variants.some(v => v.isPreBook)) ? "Pre-book" : "Details"} <FiArrowRight size={10} />
          </Link>
        ) : (() => {
          const isOutOfStock = product.stock <= 0 || (product.variants?.length === 1 && product.variants[0].stock <= 0);
          return (
          <div className="mt-2 flex gap-2">
            {(!product.isPreBook && !isOutOfStock) && (
              <button
                className="flex-grow flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 shadow-sm border bg-white text-text-main border-gray-200 hover:bg-gray-50"
                onClick={(e) => {
                  e.preventDefault();
                  const variant = product.variants?.length === 1 ? product.variants[0] : null;
                  onAddToCart(product, 1, variant);
                }}
              >
                <><FiPlus size={10} /> Add</>
              </button>
            )}
            {(!isOutOfStock || product.isPreBook) && (
              <button
                className={`flex-grow flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 shadow-sm bg-btn-dark text-white border-btn-dark hover:bg-black`}
                onClick={(e) => {
                  e.preventDefault();
                  const variant = product.variants?.length === 1 ? product.variants[0] : null;
                  onAddToCart(product, 1, variant);
                  router.push('/checkout');
                }}
              >
                {product.isPreBook ? "Pre-book" : "Buy Now"}
              </button>
            )}
          </div>
          );
        })()}
      </div>
    </div>
  );
}

