"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { FiSend, FiUser, FiInfo } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function TicketDetailPage() {
  const { id } = useParams();
  const [replyMessage, setReplyMessage] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${id}`);
      return data;
    },
    refetchInterval: 5000, // Poll every 5s for new messages
  });

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

  const handleSubmit = (e) => {
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

  if (isLoading) return <div className="p-8 text-center">Loading conversation...</div>;
  if (!ticket) return <div className="p-8 text-center">Ticket not found</div>;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div>
            <h1 className="font-bold text-gray-900 text-lg">{ticket.subject}</h1>
            <p className="text-xs text-gray-500">Ticket ID: {ticket._id}</p>
        </div>
        <div className="flex items-center gap-3">
             <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                ticket.status === 'Open' ? 'bg-green-100 text-green-700' :
                ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
            }`}>
                {ticket.status}
            </span>
             <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                'bg-gray-200 text-gray-700'
            }`}>
                {ticket.priority}
            </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        {ticket.messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                        isUser 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</div>
                        <div className={`text-[10px] mt-2 opacity-70 flex justify-end gap-1 ${isUser ? 'text-white' : 'text-gray-400'}`}>
                            {format(new Date(msg.timestamp), "MMM d, HH:mm")}
                        </div>
                    </div>
                </div>
            )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        {ticket.status === 'Closed' ? (
            <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                This ticket has been closed. You can create a new ticket if you have other issues.
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                    type="submit" 
                    disabled={replyMutation.isLoading || !replyMessage.trim()}
                    className="bg-primary text-white p-3 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiSend size={20} />
                </button>
            </form>
        )}
      </div>
    </div>
  );
}
