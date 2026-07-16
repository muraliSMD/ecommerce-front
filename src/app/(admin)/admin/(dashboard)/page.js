"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiPackage, 
  FiUsers, 
  FiTrendingUp,
  FiClock,
  FiArrowRight,
  FiGrid
} from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionLoader } from "@/components/Loader";
import { useSettingsStore } from "@/store/settingsStore";
import AnalyticsChart from "@/components/AnalyticsChart";
import CategorySalesChart from "@/components/CategorySalesChart";
import TopSellers from "@/components/TopSellers";
import { useState } from "react";
import Image from "next/image";

export default function AdminDashboard() {
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const [period, setPeriod] = useState("7d");
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const { data } = await api.get(`/admin/analytics?period=${period}`);
      return data;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
        const { data } = await api.get("/orders?limit=5");
        return Array.isArray(data) ? data.slice(0, 5) : data.orders || []; 
    }
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  const stats = [
    { label: "Revenue", value: formatPrice(analytics?.totalRevenue || 0), icon: FiDollarSign, color: "bg-green-500", trend: period.toUpperCase() },
    { label: "Orders", value: analytics?.totalOrders || 0, icon: FiShoppingBag, color: "bg-blue-500", trend: "TOTAL" },
    { label: "Products", value: analytics?.totalProducts || 0, icon: FiPackage, color: "bg-purple-500", trend: "TOTAL" },
    { label: "Total Users", value: analytics?.totalUsers || 0, icon: FiUsers, color: "bg-orange-500", trend: "TOTAL" },
  ];

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Store Overview</h1>
            <p className="text-gray-500 mt-2">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {periods.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        period === p.id 
                        ? "bg-gray-900 text-white shadow-lg" 
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase bg-gray-50 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-display font-bold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Financial Breakdown Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100"
      >
        <h2 className="text-2xl font-display font-bold mb-6">Financial Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50/50 rounded-3xl border border-green-100">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Revenue (Paid Payments)</p>
            <h4 className="text-3xl font-display font-bold text-green-700">{formatPrice(analytics?.totalRevenue || 0)}</h4>
            <p className="text-xs text-green-600 mt-2">Total amount successfully captured from completed or paid orders.</p>
          </div>
          <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">Pending & Cancelled (Unpaid)</p>
            <h4 className="text-3xl font-display font-bold text-orange-700">{formatPrice(analytics?.pendingAndCancelled || 0)}</h4>
            <p className="text-xs text-orange-600 mt-2">Active pending payments and cancelled/failed order amounts that are unpaid.</p>
          </div>
          <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100">
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Refunded & Returned</p>
            <h4 className="text-3xl font-display font-bold text-red-700">{formatPrice(analytics?.refundedAmount || 0)}</h4>
            <p className="text-xs text-red-600 mt-2">Amounts from returned orders or refunded payments.</p>
          </div>
        </div>
      </motion.div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {analytics?.chartData && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
            >
                <AnalyticsChart data={analytics.chartData} />
            </motion.div>
        )}
        {analytics?.salesByCategory && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <CategorySalesChart data={analytics.salesByCategory} />
            </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-8">
             {/* New Top Sellers and Orders Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <TopSellers data={analytics?.topSellers} />
                
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 min-h-[400px]">
                    <h2 className="text-2xl font-display font-bold mb-8">Performance Summary</h2>
                    <div className="space-y-6">
                        <div className="p-6 bg-surface rounded-3xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Conversion Rate</p>
                            <div className="flex items-end gap-2">
                                <h4 className="text-4xl font-display font-bold">3.2%</h4>
                                <span className="text-green-500 font-bold text-sm mb-1">+0.4%</span>
                            </div>
                        </div>
                        <div className="p-6 bg-surface rounded-3xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Average Order Value</p>
                            <div className="flex items-end gap-2">
                                <h4 className="text-4xl font-display font-bold">{formatPrice(analytics?.totalRevenue / (analytics?.totalOrders || 1))}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 max-w-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="w-full overflow-x-auto align-middle mt-4">
            <table className="w-full text-left min-w-[600px]">
              <thead className="whitespace-nowrap">
                <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 whitespace-nowrap">
                {recentOrders?.map((order) => (
                  <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 font-mono text-xs text-gray-400">#{order._id.slice(-8)}</td>
                    <td className="py-5">
                      <p className="font-bold text-gray-900">{order.shippingAddress?.name || "Guest"}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || order.shippingAddress?.email || "No email"}</p>
                    </td>
                    <td className="py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600' :
                        order.orderStatus === 'Processing' ? 'bg-blue-50 text-blue-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-5 font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                    <td className="py-5 text-sm text-gray-400 flex items-center gap-2">
                       <FiClock size={14} />
                       {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
                <h2 className="text-2xl font-display font-bold mb-8">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4">
                    <Link 
                    href="/admin/products/add"
                    className="group flex items-center justify-between p-6 bg-surface rounded-3xl border border-gray-100 hover:border-primary/20 hover:bg-white transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <FiPackage size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Add Product</p>
                                <p className="text-xs text-gray-500">Create new listing</p>
                            </div>
                        </div>
                        <FiArrowRight className="text-gray-300 group-hover:text-primary transition-colors" />
                    </Link>
                    
                    <Link 
                    href="/admin/categories"
                    className="group flex items-center justify-between p-6 bg-surface rounded-3xl border border-gray-100 hover:border-primary/20 hover:bg-white transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <FiGrid size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Manage Categories</p>
                                <p className="text-xs text-gray-500">Edit store sections</p>
                            </div>
                        </div>
                        <FiArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-red-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <FiPackage size={100} className="text-red-500" />
                </div>
                <div className="flex items-center gap-4 mb-6 relative">
                    <div className="bg-red-100 p-3 rounded-2xl text-red-500">
                        <FiPackage size={24} />
                    </div>
                    <h2 className="text-xl font-display font-bold text-gray-900">Low Stock Alerts</h2>
                </div>
                
                <div className="space-y-4 relative">
                    {products?.filter(p => {
                        if (!p.variants || p.variants.length === 0) return p.stock < 10;
                        return p.variants.some(v => v.stock < 5);
                    }).sort((a, b) => {
                        const aOut = (!a.variants?.length ? a.stock === 0 : a.variants.some(v => v.stock === 0));
                        const bOut = (!b.variants?.length ? b.stock === 0 : b.variants.some(v => v.stock === 0));
                        if (aOut && !bOut) return -1;
                        if (!aOut && bOut) return 1;
                        return 0;
                    }).slice(0, 5).map(product => {
                        const isNoVariant = !product.variants || product.variants.length === 0;
                        const isOutOfStock = isNoVariant ? product.stock === 0 : product.variants.some(v => v.stock === 0);
                        const lowVariantsCount = product.variants?.filter(v => v.stock < 5).length || 0;
                        const imageSrc = product.images?.[0] || product.variants?.find(v => v.images?.length > 0)?.images?.[0] || null;

                        return (
                            <div 
                                key={product._id} 
                                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:shadow-black/[0.01] ${
                                    isOutOfStock 
                                    ? 'bg-rose-50/20 border-rose-100 hover:border-rose-200' 
                                    : 'bg-amber-50/15 border-amber-100 hover:border-amber-200'
                                }`}
                            >
                                {/* Product Thumbnail */}
                                {imageSrc ? (
                                    <div className="w-11 h-11 rounded-xl overflow-hidden relative border border-gray-150/50 bg-gray-50 flex-shrink-0">
                                        <Image src={imageSrc} alt="" fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-150/50 flex items-center justify-center text-gray-400 flex-shrink-0">
                                        <FiPackage size={18} />
                                    </div>
                                )}

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs text-gray-900 truncate" title={product.name}>
                                        {product.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap flex-shrink-0 ${
                                            isOutOfStock 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-amber-500 text-white'
                                        }`}>
                                            {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                                        </span>
                                        <span className="text-gray-300 text-[10px] select-none">•</span>
                                        <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">
                                            {product.variants?.length > 0 
                                                ? `${lowVariantsCount} variant${lowVariantsCount > 1 ? 's' : ''} ${isOutOfStock ? 'out/low' : 'low'}`
                                                : `${product.stock} items left`
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link 
                                    href={`/admin/products/edit/${product._id}`} 
                                    className={`text-[11px] px-3 py-2 rounded-xl font-bold transition-all duration-300 flex-shrink-0 active:scale-95 shadow-sm ${
                                        isOutOfStock 
                                        ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/10 hover:shadow-lg' 
                                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    Restock
                                </Link>
                            </div>
                        );
                    })}
                    {(!products || products.filter(p => !p.variants?.length ? p.stock < 10 : p.variants.some(v => v.stock < 5)).length === 0) && (
                        <p className="text-center text-gray-400 text-sm py-4">All stock levels are healthy!</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
