"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function AddCoupon() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      isActive: true,
      discountType: "percentage",
      minOrderAmount: 0,
      usedCount: 0
    }
  });

  const discountType = watch("discountType");

  const createMutation = useMutation({
    mutationFn: async (data) => {
        // Cleaning empty optional fields
        const payload = { ...data };
        if (!payload.expiryDate) delete payload.expiryDate;
        if (payload.usageLimit === "") payload.usageLimit = null;
        if (payload.maxDiscountAmount === "") delete payload.maxDiscountAmount;
        
        await api.post("/coupons", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      toast.success("Coupon created successfully");
      router.push("/admin/coupons");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <div className="flex items-center gap-4">
        <Link href="/admin/coupons" className="bg-white p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <FiArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
           <h1 className="text-3xl font-display font-bold text-gray-900">Create Coupon</h1>
           <p className="text-gray-500">Add a new discount code to your store.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 space-y-6">
            
            {/* Code & Active Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Coupon Code</label>
                    <input
                        {...register("code", { required: "Coupon code is required" })}
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all uppercase placeholder:text-gray-400 font-mono tracking-wider"
                        placeholder="SUMMER2024"
                    />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
                </div>
                <div className="flex items-center">
                     <label className="flex items-center gap-3 cursor-pointer p-4 bg-surface rounded-2xl w-full border border-gray-100">
                        <input
                            type="checkbox"
                            {...register("isActive")}
                            className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
                        />
                        <span className="font-bold text-gray-700">Active</span>
                     </label>
                </div>
            </div>

            <div className="h-px bg-gray-100 my-6"></div>

            {/* Discount Logic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Discount Type</label>
                     <select
                        {...register("discountType")}
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all appearance-none"
                     >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                     </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        {discountType === 'percentage' ? "Percentage Value (%)" : "Discount Amount ($)"}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        {...register("value", { required: "Value is required", min: 0 })}
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                        placeholder="0.00"
                    />
                     {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
                </div>
            </div>

            {discountType === 'percentage' && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Max Discount Amount ($) <span className="text-gray-400 font-normal">(Optional Cap)</span></label>
                    <input
                        type="number"
                        step="0.01"
                        {...register("maxDiscountAmount")}
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                        placeholder="Unlimited"
                    />
                </div>
            )}

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Order Amount ($)</label>
                <input
                    type="number"
                    step="0.01"
                    {...register("minOrderAmount")}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    placeholder="0.00"
                />
            </div>

            <div className="h-px bg-gray-100 my-6"></div>

            {/* Restrictions */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                    <input
                        type="date"
                        {...register("expiryDate")}
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Usage Limit</label>
                    <input
                        type="number"
                        {...register("usageLimit")}
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                        placeholder="Unlimited"
                    />
                </div>
             </div>

        </section>

        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending}
          className="w-full bg-primary hover:bg-secondary text-white py-5 rounded-[1.5rem] font-bold transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {createMutation.isPending ? "Creating..." : "Save Coupon"}
          <FiSave size={20} />
        </button>
      </form>
    </div>
  );
}
