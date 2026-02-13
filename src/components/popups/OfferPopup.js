"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiGift, FiCopy, FiCheck } from "react-icons/fi";
import { useSettingsStore } from "@/store/settingsStore";
import confetti from "canvas-confetti";

export default function OfferPopup({ isOpen, onClose }) {
  const { settings } = useSettingsStore();
  const [copied, setCopied] = useState(false);

  // Fallback to defaults if settings aren't loaded yet
  const discountText = settings?.marketing?.offerDiscount || "10% OFF";
  const code = settings?.marketing?.offerCode || "WELCOME10";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-black/5 rounded-full transition-colors z-20"
            >
              <FiX className="text-gray-500" size={24} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              {/* Header Image/Pattern */}
              <div className="w-full h-32 bg-primary flex items-center justify-center relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 opacity-20 bg-[url('/pattern.png')] bg-repeat" />
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md relative z-10 animate-bounce">
                    <FiGift className="text-white text-4xl" />
                </div>
              </div>

              <div className="p-8 w-full">
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Wait!</h2>
                <p className="text-gray-500 mb-6">
                  Get <span className="font-bold text-primary">{discountText}</span> your first order.
                </p>

                {/* Coupon Code Box */}
                <div 
                  onClick={handleCopy}
                  className="bg-surface border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-2xl p-4 flex items-center justify-between cursor-pointer group transition-all mb-6 relative overflow-hidden"
                >
                  <span className="font-mono font-bold text-xl text-gray-800 tracking-wider">
                    {code}
                  </span>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </div>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
                >
                    Start Shopping
                </button>

                <p className="text-xs text-gray-400 mt-4">
                  Valid for new customers only. Terms apply.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
