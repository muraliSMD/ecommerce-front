"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function FAQFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = id && id !== "new";

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    order: 0,
    isActive: true,
  });

  const { data: faq, isLoading } = useQuery({
    queryKey: ["admin-faq", id],
    queryFn: async () => {
      const { data } = await api.get("/faqs");
      const found = data.find(f => f._id === id);
      return found;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        isActive: faq.isActive,
      });
    }
  }, [faq]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        await api.put(`/faqs/${id}`, data);
      } else {
        await api.post("/faqs", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-faqs"]);
      toast.success(isEdit ? "FAQ updated" : "FAQ created");
      router.push("/admin/faqs");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading && isEdit) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/admin/faqs" className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors shadow-sm">
                <FiArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">{isEdit ? "Edit FAQ" : "New FAQ"}</h1>
                <p className="text-sm text-gray-500 mt-1">Provide clear information for your customers.</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Question</label>
                <input
                    type="text"
                    required
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="e.g. How long does shipping take?"
                />
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Answer</label>
                <textarea
                    required
                    rows={6}
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                    placeholder="Provide a detailed answer..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-primary transition-all outline-none appearance-none"
                >
                    <option value="General">General</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Refunds">Refunds</option>
                    <option value="Payments">Payments</option>
                    <option value="Account">Account</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Display Order</label>
                <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-primary transition-all outline-none"
                />
            </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-gray-50">
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
                <span className="font-bold text-gray-900">Make FAQ Visible</span>
            </label>

            <button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
                <FiSave /> {mutation.isPending ? "Saving..." : "Save FAQ"}
            </button>
        </div>
      </form>
    </div>
  );
}
