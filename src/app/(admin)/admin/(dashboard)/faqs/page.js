"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function AdminFAQsPage() {
  const queryClient = useQueryClient();
  const [faqToDelete, setFaqToDelete] = useState(null);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data } = await api.get("/faqs");
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-faqs"]);
      toast.success("FAQ deleted successfully");
      setFaqToDelete(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      await api.put(`/faqs/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-faqs"]);
      toast.success("Status updated");
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading FAQs...</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">FAQ Management</h1>
            <p className="text-gray-500 mt-2">Manage customer help questions and documentation.</p>
        </div>
        <Link
          href="/admin/faqs/new"
          className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-primary/20"
        >
          <FiPlus /> New FAQ
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                        <th className="p-6 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Question</th>
                        <th className="p-6 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Category</th>
                        <th className="p-6 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-center">Order</th>
                        <th className="p-6 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-center">Status</th>
                        <th className="p-6 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {faqs?.map((faq) => (
                        <tr key={faq._id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="p-6">
                                <p className="font-bold text-gray-900 line-clamp-1">{faq.question}</p>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{faq.answer.substring(0, 100)}...</p>
                            </td>
                            <td className="p-6">
                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                                    {faq.category}
                                </span>
                            </td>
                            <td className="p-6 text-center text-sm font-bold text-gray-600">
                                {faq.order}
                            </td>
                            <td className="p-6 text-center">
                                <button
                                    onClick={() => toggleStatusMutation.mutate({ id: faq._id, isActive: !faq.isActive })}
                                    className={`p-2 rounded-xl border transition-all ${
                                        faq.isActive 
                                        ? "bg-green-50 text-green-600 border-green-200" 
                                        : "bg-red-50 text-red-600 border-red-200"
                                    }`}
                                >
                                    {faq.isActive ? <FiCheck /> : <FiX />}
                                </button>
                            </td>
                            <td className="p-6">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        href={`/admin/faqs/${faq._id}`}
                                        className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                    >
                                        <FiEdit2 size={18} />
                                    </Link>
                                    <button 
                                        onClick={() => setFaqToDelete(faq)}
                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {faqs?.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-20 text-center text-gray-400">
                                <p className="text-xl font-display font-medium mb-4">No FAQs Found</p>
                                <Link href="/admin/faqs/new" className="text-primary font-bold hover:underline">Add your first question</Link>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={!!faqToDelete}
        onClose={() => setFaqToDelete(null)}
        onConfirm={() => deleteMutation.mutate(faqToDelete._id)}
        title="Delete FAQ"
        message={`Are you sure? This will permanently remove this question.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
