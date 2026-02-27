"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { SectionLoader } from "@/components/Loader";
import ConfirmationModal from "@/components/ConfirmationModal";
import { FiSearch, FiMail, FiCopy, FiCheckCircle, FiTrash2 } from "react-icons/fi";

export default function SubscribersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [subscriberToDelete, setSubscriberToDelete] = useState(null);

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/subscribers");
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/subscribers?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscribers"]);
      toast.success("Subscriber removed");
      setSubscriberToDelete(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to remove subscriber"),
  });

  const filteredSubscribers = subscribers?.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const copyAllEmails = () => {
    if (!subscribers?.length) return;
    const emails = subscribers.map(s => s.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success("All emails copied to clipboard");
  };

  if (isLoading) return <SectionLoader />;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-500 mt-2">Manage your GRABSZY Club subscribers.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
            <button 
                onClick={copyAllEmails}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary transition-all active:scale-95 shadow-lg whitespace-nowrap"
            >
                <FiCopy /> Copy All Emails
            </button>
            <div className="relative w-full md:w-80">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search emails..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-black transition-colors shadow-sm"
                />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                        <th className="p-6 font-bold">Subscriber Email</th>
                        <th className="p-6 font-bold">Status</th>
                        <th className="p-6 font-bold">Joined</th>
                        <th className="p-6 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {filteredSubscribers?.map((subscriber) => (
                        <tr key={subscriber._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="p-6 font-medium text-gray-900">
                                <div className="flex items-center gap-3">
                                    <FiMail className="text-gray-400" />
                                    {subscriber.email}
                                </div>
                            </td>
                            <td className="p-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    subscriber.status === 'active' 
                                    ? "bg-green-100 text-green-600" 
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                    {subscriber.status}
                                </span>
                            </td>
                            <td className="p-6 text-gray-500">
                                {new Date(subscriber.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </td>
                            <td className="p-6 text-right">
                                <button 
                                    onClick={() => setSubscriberToDelete(subscriber)}
                                    className="p-2 bg-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Remove Subscriber"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredSubscribers?.length === 0 && (
                        <tr>
                            <td colSpan={3} className="p-12 text-center text-gray-500 italic">
                                No subscribers found matching your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {subscriberToDelete && (
        <ConfirmationModal 
          isOpen={!!subscriberToDelete}
          onClose={() => setSubscriberToDelete(null)}
          onConfirm={() => deleteMutation.mutate(subscriberToDelete._id)}
          title="Remove Subscriber"
          message={`Are you sure you want to remove "${subscriberToDelete.email}" from the newsletter list?`}
          confirmText={deleteMutation.isPending ? "Removing..." : "Remove"}
          type="danger"
        />
      )}
    </div>
  );
}
