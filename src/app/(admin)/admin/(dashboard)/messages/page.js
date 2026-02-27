"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { SectionLoader } from "@/components/Loader";
import ConfirmationModal from "@/components/ConfirmationModal";
import { FiSearch, FiMail, FiMessageSquare, FiUser, FiCalendar, FiCheckCircle, FiClock, FiTrash2 } from "react-icons/fi";

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [messageToDelete, setMessageToDelete] = useState(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data } = await api.get("/admin/contacts");
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put("/admin/contacts", { id, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-contacts"]);
      toast.success("Message status updated");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/contacts?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-contacts"]);
      toast.success("Message deleted");
      setMessageToDelete(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete message"),
  });

  const filteredMessages = messages?.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <SectionLoader />;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-2">Manage customer inquiries and contact form submissions.</p>
        </div>
        
        <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-black transition-colors shadow-sm"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredMessages?.map((msg) => (
          <div key={msg._id} className={`bg-white rounded-[2rem] border transition-all ${msg.status === 'unread' ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-gray-100 shadow-sm'} overflow-hidden`}>
            <div className="p-8">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${msg.status === 'unread' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                    <FiUser size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{msg.name}</h3>
                    <p className="text-gray-500 flex items-center gap-2"><FiMail size={14} /> {msg.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <FiCalendar size={14} /> {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    msg.status === 'unread' ? 'bg-blue-100 text-blue-600' : 
                    msg.status === 'read' ? 'bg-gray-100 text-gray-600' : 
                    'bg-green-100 text-green-600'
                  }`}>
                    {msg.status.toUpperCase()}
                  </span>
                  {msg.status === 'unread' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: msg._id, status: 'read' })}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-50 mb-4">
                <h4 className="font-bold text-gray-900 mb-2">{msg.subject}</h4>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              </div>

              <div className="flex justify-end gap-3">
                  <a 
                    href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                    onClick={() => {
                        if (msg.status !== 'replied') {
                            updateStatusMutation.mutate({ id: msg._id, status: 'replied' });
                        }
                    }}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary transition-all active:scale-95 text-sm"
                  >
                    Reply via Email
                  </a>
                  <button 
                    onClick={() => setMessageToDelete(msg)}
                    className="flex items-center gap-2 bg-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition-all active:scale-95 text-sm"
                  >
                    <FiTrash2 /> Delete
                  </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMessages?.length === 0 && (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FiClock size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-500 italic">Try adjusting your search criteria or check back later.</p>
          </div>
        )}
      </div>

      {messageToDelete && (
        <ConfirmationModal 
          isOpen={!!messageToDelete}
          onClose={() => setMessageToDelete(null)}
          onConfirm={() => deleteMutation.mutate(messageToDelete._id)}
          title="Delete Message"
          message={`Are you sure you want to delete this message from "${messageToDelete.name}"? This action cannot be undone.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Message"}
          type="danger"
        />
      )}
    </div>
  );
}
