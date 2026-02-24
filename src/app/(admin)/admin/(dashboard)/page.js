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

export default function AdminDashboard() {
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics");
      return data;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
        const { data } = await api.get("/orders?limit=5");
        // Fallback if API doesn't support limit yet, or just slice text
        return Array.isArray(data) ? data.slice(0, 5) : data.orders || []; 
    }
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"], // Keep fetching products for low stock logic (or move to API later)
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });


  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  const stats = [
    { label: "Total Revenue", value: formatPrice(analytics?.totalRevenue || 0), icon: FiDollarSign, color: "bg-green-500", trend: "Live" },
    { label: "Orders", value: analytics?.totalOrders || 0, icon: FiShoppingBag, color: "bg-blue-500", trend: "Live" },
    { label: "Products", value: analytics?.totalProducts || 0, icon: FiPackage, color: "bg-purple-500", trend: "Live" },
    { label: "Total Users", value: analytics?.totalUsers || 0, icon: FiUsers, color: "bg-orange-500", trend: "Live" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Store Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-display font-bold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Analytics Chart */}
      {analytics?.chartData && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <AnalyticsChart data={analytics.chartData} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 max-w-full">
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
                      <p className="text-xs text-gray-400">{order.user?.email || "No email"}</p>
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

        {/* Quick Actions */}
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
                        // Check if main stock is low (for non-variant products)
                        if (!p.variants || p.variants.length === 0) return p.stock < 10;
                        // Check if ANY variant is low stock
                        return p.variants.some(v => v.stock < 5);
                    }).sort((a, b) => {
                        // Sort out-of-stock to the top
                        const aOut = (!a.variants?.length ? a.stock === 0 : a.variants.some(v => v.stock === 0));
                        const bOut = (!b.variants?.length ? b.stock === 0 : b.variants.some(v => v.stock === 0));
                        if (aOut && !bOut) return -1;
                        if (!aOut && bOut) return 1;
                        return 0;
                    }).slice(0, 5).map(product => {
                        const isNoVariant = !product.variants || product.variants.length === 0;
                        const isOutOfStock = isNoVariant ? product.stock === 0 : product.variants.some(v => v.stock === 0);
                        const lowVariantsCount = product.variants?.filter(v => v.stock < 5).length || 0;

                        return (
                            <div key={product._id} className={`flex items-center gap-4 p-4 rounded-2xl border ${isOutOfStock ? 'bg-red-50 border-red-200' : 'bg-orange-50/50 border-orange-100'}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm truncate text-gray-900">{product.name}</p>
                                        {isOutOfStock && <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Out of Stock</span>}
                                    </div>
                                    <p className={`text-xs font-bold mt-1 ${isOutOfStock ? 'text-red-600' : 'text-orange-600'}`}>
                                        {product.variants?.length > 0 
                                            ? `${lowVariantsCount} variant${lowVariantsCount > 1 ? 's' : ''} ${isOutOfStock ? 'out/low' : 'low'}`
                                            : `${product.stock} items left`
                                        }
                                    </p>
                                </div>
                                <Link href={`/admin/products/edit/${product._id}`} className={`text-xs px-3 py-2 rounded-lg border font-bold transition-colors ${isOutOfStock ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'}`}>
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
