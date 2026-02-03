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

export default function AdminDashboard() {
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data;
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });

  if (ordersLoading || productsLoading) return <SectionLoader className="min-h-[60vh]" />;

  const totalRevenue = orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const recentOrders = orders?.slice(0, 5) || [];

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: FiDollarSign, color: "bg-green-500", trend: "+12.5%" },
    { label: "Orders", value: totalOrders, icon: FiShoppingBag, color: "bg-blue-500", trend: "+5.2%" },
    { label: "Products", value: totalProducts, icon: FiPackage, color: "bg-purple-500", trend: "+2" },
    { label: "Avg. Order Value", value: formatPrice(totalOrders > 0 ? (totalRevenue / totalOrders) : 0), icon: FiTrendingUp, color: "bg-orange-500", trend: "Stable" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900">Store Overview</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 font-mono text-xs text-gray-400">#{order._id.slice(-8)}</td>
                    <td className="py-5">
                      <p className="font-bold text-gray-900">{order.shippingAddress?.name || "Guest"}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || "No email"}</p>
                    </td>
                    <td className="py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        order.status === 'Completed' ? 'bg-green-50 text-green-600' :
                        order.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {order.status || 'Pending'}
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
             }).slice(0, 5).map(product => (
                 <div key={product._id} className="flex items-center gap-4 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                     <div className="flex-1 min-w-0">
                         <p className="font-bold text-sm truncate text-gray-900">{product.name}</p>
                         <p className="text-xs text-red-500 font-bold mt-1">
                             {product.variants?.length > 0 
                                ? `${product.variants.filter(v => v.stock < 5).length} variants low`
                                : `${product.stock} items left`
                             }
                         </p>
                     </div>
                     <Link href={`/admin/products/edit/${product._id}`} className="text-xs bg-white text-gray-900 px-3 py-2 rounded-lg border border-gray-200 font-bold hover:bg-gray-50">
                         Restock
                     </Link>
                 </div>
             ))}
             {(!products || products.filter(p => !p.variants?.length ? p.stock < 10 : p.variants.some(v => v.stock < 5)).length === 0) && (
                 <p className="text-center text-gray-400 text-sm py-4">All stock levels are healthy!</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
