"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMail, FiCheckCircle } from "react-icons/fi";
import { useSettingsStore } from "@/store/settingsStore";

export default function SignupPopup({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here API call to subscribe would go
    setSubmitted(true);
    setTimeout(() => {
        onClose();
        setSubmitted(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-20"
            >
              <FiX className="text-gray-500" size={20} />
            </button>

            {/* Left/Image Side (Hidden on mobile) */}
            <div className="hidden md:block w-1/3 bg-gray-900 relative">
                 <div className="absolute inset-0 opacity-50 bg-[url('/pattern.png')] bg-cover" />
                 <div className="h-full flex items-center justify-center">
                    <FiMail className="text-white/20 text-6xl" />
                 </div>
            </div>

            {/* Content Side */}
            <div className="flex-1 p-8">
                {submitted ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <FiCheckCircle className="text-green-500 text-5xl mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Subscribed!</h3>
                        <p className="text-gray-500 text-sm">Thank you for joining.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Newsletter</span>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-1">Stay in the loop</h2>
                            <p className="text-gray-500 text-sm mt-2">
                                Subscribe for exclusive offers usage updates.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="email" 
                                required
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-surface border border-gray-100 focus:border-primary px-4 py-3 rounded-xl outline-none transition-all text-sm"
                            />
                            <button 
                                type="submit"
                                className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
                            >
                                Subscribe
                            </button>
                        </form>
                        
                        <button 
                            onClick={onClose}
                            className="w-full text-center text-xs text-gray-400 mt-4 hover:text-gray-600 underline"
                        >
                            No thanks
                        </button>
                    </>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
