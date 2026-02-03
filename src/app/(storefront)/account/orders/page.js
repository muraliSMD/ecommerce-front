"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { FiPackage, FiArrowRight, FiSearch } from "react-icons/fi";
import { useSettingsStore } from "@/store/settingsStore"; // Use global formatter

export default function MyOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data;
    },
  });

  const formatPrice = useSettingsStore((state) => state.formatPrice);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-white rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6">
            <FiPackage size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
        <p className="text-gray-500 mt-2 mb-8">Looks like you haven&apos;t placed any orders yet.</p>
        <Link href="/shop" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
            Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-gray-900">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link 
            key={order._id} 
            href={`/account/orders/${order._id}`}
            className="block bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900 text-lg">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-600' :
                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                        }`}>
                            {order.orderStatus}
                        </span>
                   </div>
                   <p className="text-gray-500 text-sm"> Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                        {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 overflow-hidden relative">
                                <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                +{order.items.length - 3}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[200px]">
                    <span className="font-bold text-gray-900 text-xl">{formatPrice(order.totalAmount)}</span>
                    <FiArrowRight className="text-gray-400 group-hover:text-primary transition-colors" size={24} />
                </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
