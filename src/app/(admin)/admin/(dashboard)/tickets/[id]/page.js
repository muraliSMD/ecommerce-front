"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { FiSend, FiUser, FiArrowLeft, FiSave } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function AdminTicketDetailPage() {
  const { id } = useParams();
  const [replyMessage, setReplyMessage] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${id}`);
      return data;
    },
    refetchInterval: 5000, 
  });

  useEffect(() => {
    if (ticket) {
        setStatus(ticket.status);
        setPriority(ticket.priority);
    }
  }, [ticket]);

  const replyMutation = useMutation({
    mutationFn: async (message) => {
      await api.put(`/tickets/${id}`, { message });
    },
    onSuccess: () => {
      setReplyMessage("");
      queryClient.invalidateQueries(["ticket", id]);
    },
    onError: () => {
        toast.error("Failed to send reply");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/tickets/${id}`, { status, priority });
    },
    onSuccess: () => {
      toast.success("Ticket updated successfully");
      queryClient.invalidateQueries(["ticket", id]);
    },
    onError: () => {
        toast.error("Failed to update ticket");
    }
  });

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    replyMutation.mutate(replyMessage);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  if (isLoading) return <div className="p-8 text-center">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center">Ticket not found</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tickets" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <FiArrowLeft size={24} />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
            <p className="text-gray-500 text-sm">
                From: <span className="font-bold text-gray-800">{ticket.user?.name}</span> ({ticket.user?.email})
            </p>
        </div>
        <div className="ml-auto flex gap-3">
             <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg text-sm font-bold bg-white"
             >
                 <option value="Open">Open</option>
                 <option value="In Progress">In Progress</option>
                 <option value="Closed">Closed</option>
             </select>
             <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg text-sm font-bold bg-white"
             >
                 <option value="Low">Low Priority</option>
                 <option value="Medium">Medium Priority</option>
                 <option value="High">High Priority</option>
             </select>
             <button 
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isLoading}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary transition-colors flex items-center gap-2"
             >
                 <FiSave /> Save
             </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
            {ticket.messages.map((msg, index) => {
                const isAdminSender = msg.sender === 'admin';
                return (
                    <div key={index} className={`flex ${isAdminSender ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-5 shadow-sm ${
                            isAdminSender
                                ? 'bg-white border border-gray-200 text-gray-800 rounded-br-none' 
                                : 'bg-primary/5 border border-primary/10 text-gray-800 rounded-bl-none'
                        }`}>
                            <div className="flex items-center gap-2 mb-2 opacity-60 text-xs font-bold uppercase tracking-wider">
                                {isAdminSender ? "You (Admin)" : ticket.user?.name}
                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                {format(new Date(msg.timestamp), "MMM d, HH:mm")}
                            </div>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</div>
                        </div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Reply Input */}
        <div className="p-4 bg-white border-t border-gray-100">
             <form onSubmit={handleReply} className="flex gap-4">
                <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                    type="submit" 
                    disabled={replyMutation.isLoading || !replyMessage.trim()}
                    className="bg-primary text-white px-8 rounded-xl hover:bg-secondary transition-colors font-bold flex items-center gap-2"
                >
                    <FiSend /> Send
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
