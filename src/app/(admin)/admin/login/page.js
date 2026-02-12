"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiShield } from "react-icons/fi";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/users/login", formData);
      
      if (data.user.role !== 'admin') {
        toast.error("Access denied. Admin role required.");
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      toast.success("Welcome, Admin");
      router.push("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
          
          <div className="text-center mb-12">
            <div className="bg-primary/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary ring-1 ring-primary/30 group-hover:scale-110 transition-transform duration-500">
              <FiShield size={32} />
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight">GRABSZY <span className="text-primary">Admin</span></h1>
            <p className="text-gray-400 mt-3 font-medium">Restricted Access Area</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative group/input">
                <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 px-14 py-5 rounded-[1.5rem] outline-none transition-all text-white placeholder:text-gray-600 font-medium"
                  placeholder="admin@grabszy.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">Secret Password</label>
              <div className="relative group/input">
                <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 px-14 py-5 rounded-[1.5rem] outline-none transition-all text-white placeholder:text-gray-600 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-secondary text-white py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 mt-4 group/btn"
            >
              {loading ? "Verifying..." : (
                <>
                  Enter Dashboard 
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-8 font-medium">
            Authorized Personnel Only. Log attempts are recorded.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
