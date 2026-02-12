"use client";
import Image from "next/image";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useSettingsStore } from "@/store/settingsStore";

export default function CartItem({ item, onRemove, onIncrement, onDecrement }) {
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const price = Number(item.variant?.price ?? item.product.price ?? 0);
  const image = item.variant?.images?.[0] || item.product.images?.[0] || "/placeholder.png";

  return (
    <div className="group bg-white rounded-[2rem] p-4 flex gap-6 items-center border border-gray-100 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-black/5">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-surface flex-shrink-0 relative">
        <Image 
            src={image} 
            alt={item.product.name} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      </div>

      <div className="flex-grow space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-display font-bold text-gray-900 line-clamp-1">{item.product.name}</h3>
            {item.variant && (
              <p className="text-xs font-bold uppercase tracking-wider text-primary/60 mt-1">
                {item.variant.color} • {item.variant.size}
              </p>
            )}
          </div>
          <button 
            onClick={onRemove}
            className="text-gray-300 hover:text-red-500 transition-colors p-2"
          >
            <FiTrash2 size={20} />
          </button>
        </div>

        <div className="flex justify-between items-end pt-2">
          <p className="text-xl font-bold text-gray-900">{formatPrice(price)}</p>
          
          <div className="flex items-center bg-surface border border-gray-100 rounded-xl p-1">
            <button 
              onClick={onDecrement}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
            >
              <FiMinus size={14} />
            </button>
            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
            <button 
              onClick={onIncrement}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
            >
              <FiPlus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

