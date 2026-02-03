"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiMapPin, FiTruck, FiCreditCard } from "react-icons/fi";
import { useSettingsStore } from "@/store/settingsStore";
import Image from "next/image";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
  });

  if (isLoading) return <div className="h-96 bg-white rounded-3xl animate-pulse" />;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="space-y-8">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-4 transition-colors">
        <FiArrowLeft /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h1>
            <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>
        <span className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider ${
             order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-600' :
             order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-600' :
             'bg-yellow-100 text-yellow-600'
        }`}>
            {order.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="font-bold text-xl mb-6">Items</h3>
                <div className="space-y-6">
                    {order.items.map((item, i) => (
                         <div key={i} className="flex gap-4 items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden relative flex-shrink-0">
                                <Image 
                                    src={item.product?.images?.[0] || item.variant?.images?.[0] || "/placeholder.jpg"} 
                                    alt="Product" 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{item.product?.name || "Product"}</h4>
                                {item.variant && (
                                    <p className="text-sm text-gray-500">
                                        {item.variant.color} / {item.variant.size}
                                    </p>
                                )}
                                <p className="text-sm text-gray-900 font-bold mt-1">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                         </div>
                    ))}
                </div>
            </div>

            {/* Timeline Placeholder */}
            {/* Could add a visual timeline here if order status history was available */}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <FiMapPin /> <span className="text-xs font-bold uppercase tracking-widest">Shipping To</span>
                </div>
                <p className="font-bold text-gray-900">{order.shippingAddress?.name}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
                <p className="text-sm text-gray-500 mt-2">{order.shippingAddress?.address}</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                     <FiCreditCard /> <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Method</span>
                    <span className="font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${
                        order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{order.paymentStatus}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                 <div className="flex justify-between text-gray-500 mb-2">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                 </div>
                 <div className="flex justify-between text-gray-500 mb-4">
                    <span>Shipping</span>
                    <span className="text-primary font-bold">FREE</span>
                 </div>
                 <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-xl text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
