"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";
import { FiX, FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";

export default function AuthModal() {
  const { isAuthModalOpen, authMode, setAuthModalOpen, login } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (!isAuthModalOpen) return null;

  const mode = authMode; // "login" | "signup"

  const toggleMode = () => {
    setAuthModalOpen(true, mode === "login" ? "signup" : "login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === "login" ? "/api/users/login" : "/api/users/register";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === "login") {
          login(data.token, data.user);
          toast.success("Welcome back to STXRE!");
          setAuthModalOpen(false);
        } else {
          toast.success("Account created! Please login.");
          setAuthModalOpen(true, "login");
        }
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAuthModalOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <FiX size={24} />
          </button>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-2xl font-display">S</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 mt-2">
              {mode === "login" 
                ? "Sign in to access your STXRE account" 
                : "Join the STXRE movement today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-12 py-4 rounded-2xl outline-none transition-all"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-12 py-4 rounded-2xl outline-none transition-all"
                required
              />
            </div>

            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-12 py-4 rounded-2xl outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-4"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
              <FiArrowRight />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="text-primary font-bold hover:underline"
            >
              {mode === "login" ? "Sign Up Now" : "Sign In"}
            </button>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
