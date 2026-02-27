"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FiSearch, FiUser, FiSlash, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { SectionLoader } from "@/components/Loader";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToBan, setUserToBan] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: async ({ userId, isBanned }) => {
      await api.put("/admin/users", { userId, isBanned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User status updated");
      setUserToBan(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      await api.delete(`/admin/users?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User deleted successfully");
      setUserToDelete(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete user"),
  });

  const filteredUsers = users?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <SectionLoader />;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-2">Manage registered users and access.</p>
        </div>
        
        <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-black transition-colors shadow-sm"
            />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                        <th className="p-6 font-bold">Customer</th>
                        <th className="p-6 font-bold">Role</th>
                        <th className="p-6 font-bold">Joined</th>
                        <th className="p-6 font-bold">Status</th>
                        <th className="p-6 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {filteredUsers?.map((user) => (
                        <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    user.role === 'admin' 
                                    ? "bg-purple-100 text-purple-600" 
                                    : "bg-green-100 text-green-600"
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-6 text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    user.isBanned 
                                    ? "bg-red-100 text-red-600" 
                                    : "bg-blue-100 text-blue-600"
                                }`}>
                                    {user.isBanned ? "Banned" : "Active"}
                                </span>
                            </td>
                            <td className="p-6 text-right">
                                {user.role !== 'admin' && (
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => setUserToBan(user)}
                                            className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
                                                user.isBanned
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-red-100 text-red-700 hover:bg-red-200"
                                            }`}
                                        >
                                            {user.isBanned ? "Unban" : "Ban User"}
                                        </button>
                                        <button 
                                            onClick={() => setUserToDelete(user)}
                                            className="p-2 bg-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Account"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredUsers?.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-500 italic">
                                No customers found matching your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {userToBan && (
        <ConfirmationModal 
          isOpen={!!userToBan}
          onClose={() => setUserToBan(null)}
          onConfirm={() => toggleBanMutation.mutate({ 
            userId: userToBan._id, 
            isBanned: !userToBan.isBanned 
          })}
          title={userToBan.isBanned ? "Unban User" : "Ban User"}
          message={`Are you sure you want to ${userToBan.isBanned ? 'unban' : 'ban'} "${userToBan.name}"? ${userToBan.isBanned ? 'They will regain access to their account.' : 'They will lose access to their account immediately.'}`}
          confirmText={toggleBanMutation.isPending ? "Updating..." : (userToBan.isBanned ? "Unban User" : "Ban User")}
          type={userToBan.isBanned ? "info" : "danger"}
        />
      )}

      {userToDelete && (
        <ConfirmationModal 
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={() => deleteMutation.mutate(userToDelete._id)}
          title="Delete User Account"
          message={`Are you sure you want to delete the account for "${userToDelete.name}"? This action cannot be undone and all their data will be permanently removed.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Account"}
          type="danger"
        />
      )}
    </div>
  );
}
