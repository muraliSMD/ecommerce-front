"use client";

import Image from "next/image";
import { useSettingsStore } from "@/store/settingsStore";
import { FiTrendingUp } from "react-icons/fi";

export default function TopSellers({ data }) {
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 h-full flex items-center justify-center">
        <p className="text-gray-400">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-display font-bold text-gray-900">Top Sellers</h2>
        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
            <FiTrendingUp size={20} />
        </div>
      </div>
      
      <div className="space-y-6">
        {data.map((product, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                <Image 
                    src={product.image || '/placeholder.png'} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate text-sm">{product.name}</p>
                <p className="text-xs text-gray-500">{product.totalQty} units sold</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-gray-900 text-sm">{formatPrice(product.revenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
