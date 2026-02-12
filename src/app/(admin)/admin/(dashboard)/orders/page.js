"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiShoppingBag, 
  FiClock, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiTruck,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiArrowRight,
  FiUser,
  FiMapPin,
  FiMail,
  FiPhone,
  FiTrash2
} from "react-icons/fi";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/settingsStore";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/orders/${id}`, { orderStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete order");
    }
  });

  const filteredOrders = orders?.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-2">Manage customer purchases and fulfillment.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-xl shadow-black/5 border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search orders by ID or customer name..."
            className="w-full pl-12 pr-4 py-3 bg-surface rounded-2xl border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-surface text-gray-600 rounded-2xl border border-gray-100 flex items-center gap-2 font-bold text-sm hover:bg-white transition-all">
          <FiFilter /> Filter Status
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 overflow-hidden relative">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              {/* Order Info */}
              <div className="space-y-6 flex-grow">
                <div className="flex items-center gap-4">
                  <div className="bg-surface p-4 rounded-2xl text-gray-400">
                    <FiShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        order.orderStatus === 'Completed' ? 'bg-green-50 text-green-600' :
                        order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600' :
                        order.orderStatus === 'Processing' ? 'bg-blue-50 text-blue-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FiClock size={14} /> {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</p>
                    <div className="flex items-center gap-2 text-sm">
                      <FiUser className="text-primary" />
                      <span className="font-bold">{order.shippingAddress?.name || "Guest"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiMail className="text-gray-300" />
                      <span>{order.user?.email || "No email"}</span>
                    </div>
                    {order.shippingAddress?.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiPhone className="text-gray-300" />
                        <span>{order.shippingAddress.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <FiMapPin className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">
                        {order.shippingAddress?.address},<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Total</p>
                    <p className="text-2xl font-display font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-gray-400">{order.items.length} items • {order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Status Controls */}
              <div className="lg:w-64 flex flex-col justify-center border-l border-gray-50 pl-8 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'Processing' })}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiClock /> <span className="text-[10px] font-bold uppercase">Proc.</span>
                  </button>
                  <button 
                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'Shipped' })}
                    className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiTruck /> <span className="text-[10px] font-bold uppercase">Ship.</span>
                  </button>
                  <button 
                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'Delivered' })}
                    className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle /> <span className="text-[10px] font-bold uppercase">Deliv.</span>
                  </button>
                  <button 
                    onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'Cancelled' })}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle className="rotate-45" /> <span className="text-[10px] font-bold uppercase">Canc.</span>
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('Are you sure you want to delete this order?')) {
                        deleteMutation.mutate(order._id);
                      }
                    }}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 col-span-2 mt-2"
                  >
                    <FiTrash2 /> <span className="text-[10px] font-bold uppercase">Delete Order</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Item List Toggle (simplified list view) */}
            <div className="mt-8 pt-6 border-t border-gray-50">
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex-shrink-0 flex items-center gap-3 bg-surface p-2 rounded-xl pr-4 border border-gray-50">
                       <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 relative">
                          <Image 
                            src={item.product?.images?.[0] || "/placeholder.png"} 
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover" 
                          />
                       </div>
                       <div className="text-[10px]">
                          <p className="font-bold text-gray-900 line-clamp-1">{item.product?.name || "Product Deleted"}</p>
                          <p className="text-gray-400">Qty: {item.quantity} • {item.variant?.size}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="p-20 text-center text-gray-400 bg-white rounded-[2.5rem] border border-dashed border-gray-100">
            <FiShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-display">No orders matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
