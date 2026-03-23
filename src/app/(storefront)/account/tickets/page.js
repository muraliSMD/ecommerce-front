"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { FiPlus, FiMessageSquare } from "react-icons/fi";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function TicketsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "", priority: "Medium" });
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async () => {
      const { data } = await api.get("/tickets");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/tickets", data);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setNewTicket({ subject: "", message: "", priority: "Medium" });
      queryClient.invalidateQueries(["my-tickets"]);
      toast.success("Ticket created successfully");
    },
    onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create ticket");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(newTicket);
  };

   if (isLoading) return <div className="p-8 text-center text-text-muted">Loading tickets...</div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-main">Support Tickets</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-secondary transition-colors"
        >
          <FiPlus /> New Ticket
        </button>
      </div>

       <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-main overflow-hidden">
        {tickets?.length > 0 ? (
             <table className="w-full text-left">
                <thead className="bg-bg-section border-b border-border-main">
                    <tr>
                         <th className="p-4 font-bold text-text-muted text-sm">Subject</th>
                        <th className="p-4 font-bold text-text-muted text-sm">Status</th>
                        <th className="p-4 font-bold text-text-muted text-sm">Last Update</th>
                        <th className="p-4 font-bold text-text-muted text-sm text-right">Action</th>
                    </tr>
                </thead>
                 <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket._id} className="border-b border-border-main/50 last:border-0 hover:bg-bg-section/30 transition-colors">
                             <td className="p-4">
                                <p className="font-bold text-text-main">{ticket.subject}</p>
                                <p className="text-xs text-text-muted/60">ID: {ticket._id.slice(-6)}</p>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                    ticket.status === 'Open' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                     {ticket.status}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-text-muted">
                                {format(new Date(ticket.updatedAt), "MMM d, HH:mm")}
                            </td>
                            <td className="p-4 text-right">
                                <Link
                                    href={`/account/tickets/${ticket._id}`}
                                    className="inline-flex items-center gap-2 text-primary hover:text-secondary font-bold text-sm"
                                >
                                    View <FiMessageSquare />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
             <div className="p-12 text-center text-text-muted">
                <p>No support tickets found.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-primary font-bold mt-2 hover:underline">Create one?</button>
            </div>
        )}
      </div>

       {/* New Ticket Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-bg-surface rounded-2xl w-full max-w-md p-6 space-y-4 border border-border-main shadow-2xl">
                  <h2 className="text-xl font-bold text-text-main">Create New Ticket</h2>
                   <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-text-muted mb-1">Subject</label>
                          <input 
                              type="text" 
                              required
                               value={newTicket.subject}
                              onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                              className="w-full bg-bg-surface p-3 border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                              placeholder="e.g., Order #1234 Issue"
                          />
                      </div>
                       <div>
                          <label className="block text-sm font-bold text-text-muted mb-1">Priority</label>
                          <select 
                               value={newTicket.priority}
                              onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                              className="w-full bg-bg-surface p-3 border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                          >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                          </select>
                      </div>
                       <div>
                          <label className="block text-sm font-bold text-text-muted mb-1">Message</label>
                          <textarea 
                              required
                               value={newTicket.message}
                              onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                              className="w-full bg-bg-surface p-3 border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-none text-text-main"
                              placeholder="Describe your issue..."
                          />
                      </div>
                      <div className="flex gap-3 pt-2">
                           <button 
                              type="button" 
                              onClick={() => setIsModalOpen(false)}
                              className="flex-1 py-3 rounded-xl border border-border-main font-bold text-text-muted hover:bg-bg-section/50"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit" 
                              disabled={createMutation.isLoading}
                              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-secondary disabled:opacity-50"
                          >
                              {createMutation.isLoading ? "Creating..." : "Submit Ticket"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
