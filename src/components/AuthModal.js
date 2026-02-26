"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";
import { FiX, FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";

export default function AuthModal() {
  const queryClient = useQueryClient();
  const { isAuthModalOpen, authMode, setAuthModalOpen, login } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [mode, setMode] = useState(authMode); // Local state to handle "forgot_password"

  if (!isAuthModalOpen) return null;

  if (!isAuthModalOpen) return null;

  // Sync local mode with global store, but allow local override for "forgot_password"
  // Actually, better to just use local state for the view if we want to keep it simple, 
  // or update store if we want "forgot_password" to be a global mode. 
  // Let's use local state override for temporary views like forgot password.
  
  const currentMode = mode === "forgot_password" ? "forgot_password" : authMode;

  const toggleMode = () => {
    if (currentMode === "forgot_password") {
        setMode("login"); // Back to login
        setAuthModalOpen(true, "login");
    } else {
        setAuthModalOpen(true, authMode === "login" ? "signup" : "login");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentMode === "forgot_password") {
        const res = await fetch("/api/user/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("Check your email for the reset link!");
            setMode("login");
            setAuthModalOpen(false);
        } else {
            toast.error(data.message || "Something went wrong");
        }
      } else {
          const url = authMode === "login" ? "/api/users/login" : "/api/users/register";
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
    
          const data = await res.json();
    
          if (res.ok) {
            if (authMode === "login") {
              login(data.user, data.token);
              // Invalidate all queries to refresh data (like linked guest orders)
              queryClient.invalidateQueries();
              toast.success("Welcome back to GRABSZY!");
              setAuthModalOpen(false);
            } else {
              toast.success("Account created! Please login.");
              setAuthModalOpen(true, "login");
            }
          } else {
            toast.error(data.message || "Something went wrong");
          }
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
              {currentMode === "login" ? "Welcome Back" : currentMode === "signup" ? "Create Account" : "Reset Password"}
            </h2>
            <p className="text-gray-500 mt-2">
              {currentMode === "login" 
                ? "Sign in to access your GRABSZY account" 
                : currentMode === "signup" 
                ? "Join the GRABSZY movement today"
                : "Enter your email to receive a reset link"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentMode === "signup" && (
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

            {currentMode !== "forgot_password" && (
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
            )}
            
            {currentMode === "login" && (
                <div className="flex justify-end">
                    <button 
                        type="button"
                        onClick={() => setMode("forgot_password")}
                        className="text-sm text-gray-500 hover:text-primary transition-colors"
                    >
                        Forgot Password?
                    </button>
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-4"
            >
              {loading ? "Please wait..." : currentMode === "login" ? "Sign In" : currentMode === "signup" ? "Sign Up" : "Send Reset Link"}
              <FiArrowRight />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            {currentMode === "login" ? "Don't have an account?" : currentMode === "signup" ? "Already have an account?" : "Remember your password?"}{" "}
            <button
              onClick={toggleMode}
              className="text-primary font-bold hover:underline"
            >
              {currentMode === "login" ? "Sign Up Now" : "Sign In"}
            </button>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
