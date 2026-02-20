"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { FiEye, FiMessageSquare, FiFilter } from "react-icons/fi";
import { format } from "date-fns";

export default function AdminTicketsPage() {
  const [filter, setFilter] = useState("All");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data } = await api.get("/tickets");
      return data;
    },
  });

  const filteredTickets = tickets?.filter(ticket => {
      if (filter === "All") return true;
      return ticket.status === filter;
  });

  if (isLoading) return <div className="p-8 text-center">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        
        <div className="flex bg-white rounded-xl border border-gray-100 p-1">
            {["All", "Open", "In Progress", "Closed"].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        filter === status 
                        ? "bg-primary text-white shadow-sm" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-4 font-bold text-gray-500 text-sm">Subject</th>
                    <th className="p-4 font-bold text-gray-500 text-sm">User</th>
                    <th className="p-4 font-bold text-gray-500 text-sm">Status</th>
                    <th className="p-4 font-bold text-gray-500 text-sm">Priority</th>
                    <th className="p-4 font-bold text-gray-500 text-sm">Last Update</th>
                    <th className="p-4 font-bold text-gray-500 text-sm text-right">Action</th>
                </tr>
            </thead>
            <tbody>
                {filteredTickets?.map((ticket) => (
                    <tr key={ticket._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                            <p className="font-bold text-gray-900 truncate max-w-xs">{ticket.subject}</p>
                            <p className="text-xs text-gray-400">ID: {ticket._id.slice(-6)}</p>
                        </td>
                         <td className="p-4">
                            <p className="font-bold text-gray-700 text-sm">{ticket.user?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-400">{ticket.user?.email}</p>
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
                         <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                                ticket.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {ticket.priority}
                            </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                            {format(new Date(ticket.updatedAt), "MMM d, HH:mm")}
                        </td>
                        <td className="p-4 text-right">
                            <Link
                                href={`/admin/tickets/${ticket._id}`}
                                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                            >
                                View <FiMessageSquare />
                            </Link>
                        </td>
                    </tr>
                ))}
                {filteredTickets?.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-500">
                            No tickets found with status "{filter}".
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
