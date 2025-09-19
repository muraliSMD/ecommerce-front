// app/auth/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
 const res = await fetch("http://localhost:5000/api/users/login", {
  method : "POST",
  headers: {"content-Type" : "application/json"},
  body: JSON.stringify({email, password}),
 });

  if (res.ok) { 
    login(data.token, data.user);
    toast.success("Logged in successfully");
    router.push("/");
  } else {
    toast.error(data.message || "Login failed");
  }
  } catch {
    toast.error("Something went wrong!");
  } finally {
    setLoading(false);
  }
 }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-700">
          Dont have an account?{" "}
          <a href="/auth/signup" className="text-indigo-600 font-medium hover:underline">
            Sign Up
          </a>
        </p>
        
      </div>
    </div>
  );
}
