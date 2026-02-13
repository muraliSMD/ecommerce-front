"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiLock, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

export default function ResetPasswordPage({ params }) {
  const router = useRouter();
  const { token } = use(params);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthModalOpen = useUserStore((state) => state.setAuthModalOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful! Please login.");
        router.push("/");
        setTimeout(() => setAuthModalOpen(true, "login"), 500);
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
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <FiLock className="text-white text-xl" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900">
                Set New Password
            </h2>
            <p className="text-gray-500 mt-2">
                Enter your new password below to secure your account.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-12 py-4 rounded-2xl outline-none transition-all"
                required
              />
            </div>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-12 py-4 rounded-2xl outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-4"
            >
              {loading ? "Resetting..." : "Reset Password"}
              <FiArrowRight />
            </button>
        </form>
      </motion.div>
    </div>
  );
}
