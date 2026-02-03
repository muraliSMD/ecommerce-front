"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FiUser, FiLock, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

export default function ProfilePage() {
  const { userInfo, setUserInfo } = useUserStore(); // Update global store on change
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const { data: user, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await api.get("/user/profile");
      return data;
    },
  });

  useEffect(() => {
    if (user) {
        setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const { data: updatedUser } = await api.put("/user/profile", data);
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully");
      setUserInfo({ ...userInfo, name: updatedUser.name });
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
    }
    
    // Only send fields that are needed
    const { confirmPassword, ...dataToSend } = formData;
    if (!dataToSend.password) delete dataToSend.password;

    updateMutation.mutate(dataToSend);
  };

  if (isLoading) return <div className="h-96 bg-white rounded-3xl animate-pulse" />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
         
         <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-3xl">
                {user?.name?.charAt(0)}
            </div>
            <div>
                <h3 className="font-bold text-xl text-gray-900">{user?.name}</h3>
                <p className="text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-surface pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900"
                    />
                </div>
            </div>
            
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="w-full bg-gray-50 px-4 py-3 rounded-xl text-gray-500 font-medium cursor-not-allowed">
                    {formData.email}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 pl-1">Email cannot be changed.</p>
            </div>

            <div className="md:col-span-2 pt-6 border-t border-gray-50">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Change Password</h4>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-surface pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Leave blank to keep current"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="password" 
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full bg-surface pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Confirm new password"
                    />
                </div>
            </div>
         </div>

         <div className="pt-8 flex justify-end">
            <button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                {!updateMutation.isPending && <FiCheck />}
            </button>
         </div>
      </form>
    </div>
  );
}
