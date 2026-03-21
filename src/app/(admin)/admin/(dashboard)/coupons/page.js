"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiPlus, 
  FiSearch, 
  FiTrash2, 
  FiEdit2,
  FiTag,
  FiUsers,
  FiX
} from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import { SectionLoader } from "@/components/Loader";
import { useSettingsStore } from "@/store/settingsStore";
import { format } from "date-fns";

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [viewingUsage, setViewingUsage] = useState(null);
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data } = await api.get("/coupons");
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      toast.success("Coupon deleted successfully");
      setCouponToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete coupon");
    }
  });

  const filteredCoupons = coupons?.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 mt-2">Manage discounts and promo codes.</p>
        </div>
        <Link 
          href="/admin/coupons/add"
          className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <FiPlus size={20} /> Create New Coupon
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search coupons..."
            className="w-full bg-surface border-none focus:ring-2 focus:ring-primary/20 pl-14 pr-6 py-4 rounded-2xl outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-6">Code</th>
                <th className="px-8 py-6">Discount</th>
                <th className="px-8 py-6">Usage</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Expiry</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <FiTag />
                      </div>
                      <span className="font-bold text-gray-900 font-mono tracking-wider">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-gray-900">
                        {coupon.discountType === 'percentage' 
                            ? `${coupon.value}% OFF` 
                            : `${formatPrice(coupon.value)} OFF`
                        }
                    </span>
                    {coupon.minOrderAmount > 0 && (
                        <p className="text-[10px] text-gray-400 mt-1">Min: {formatPrice(coupon.minOrderAmount)}</p>
                    )}
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-sm font-medium">
                        {coupon.usedCount} / {coupon.usageLimit === null ? '∞' : coupon.usageLimit}
                     </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        coupon.isActive 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500">
                    {coupon.expiryDate ? format(new Date(coupon.expiryDate), 'MMM dd, yyyy') : 'No Expiry'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingUsage(coupon)}
                        className="p-3 bg-surface text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        title="View Usage"
                      >
                         <FiUsers size={16} />
                      </button>
                      <Link
                        href={`/admin/coupons/edit/${coupon._id}`}
                        className="p-3 bg-surface text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                         <FiEdit2 size={16} />
                      </Link>
                      <button 
                        onClick={() => setCouponToDelete(coupon)}
                        className="p-3 bg-surface text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCoupons.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-surface w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FiTag size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No coupons found</h3>
              <p className="text-gray-500">Create your first coupon to get started.</p>
            </div>
          )}
        </div>
      </div>

      {couponToDelete && (
        <ConfirmationModal 
          isOpen={!!couponToDelete}
          onClose={() => setCouponToDelete(null)}
          onConfirm={() => deleteMutation.mutate(couponToDelete._id)}
          title="Delete Coupon"
          message={`Are you sure you want to delete "${couponToDelete.code}"? This action cannot be undone.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Coupon"}
        />
      )}

      {viewingUsage && (
        <UsageModal 
          coupon={viewingUsage} 
          onClose={() => setViewingUsage(null)} 
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}

function UsageModal({ coupon, onClose, formatPrice }) {
    const { data: usage, isLoading } = useQuery({
        queryKey: ["coupon-usage", coupon.code],
        queryFn: async () => {
            const { data } = await api.get(`/admin/coupons/${coupon.code}/usage`);
            return data;
        },
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-surface/50">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-gray-900">Coupon Usage</h2>
                        <p className="text-gray-500 text-sm mt-1">Customers who used code: <span className="font-mono font-bold text-primary">{coupon.code}</span></p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {isLoading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : usage?.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                    <th className="pb-4">Customer</th>
                                    <th className="pb-4">Order Details</th>
                                    <th className="pb-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {usage.map((u) => (
                                    <tr key={u._id} className="group">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {u.user?.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{u.user?.name || "Guest User"}</p>
                                                    <p className="text-xs text-gray-400">{u.user?.email || "No email"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <p className="text-sm font-medium text-gray-700">{u.order?.orderId}</p>
                                            <p className="text-xs text-gray-400">{formatPrice(u.order?.totalAmount)}</p>
                                        </td>
                                        <td className="py-4 text-right">
                                            <p className="text-xs text-gray-500">
                                                {format(new Date(u.usedAt), 'MMM dd, yyyy')}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center">
                            <p className="text-gray-400">This coupon hasn't been used yet.</p>
                        </div>
                    )}
                </div>
                
                <div className="p-8 border-t border-gray-100 bg-surface/30 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
