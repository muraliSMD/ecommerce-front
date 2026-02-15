"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FiCheckCircle, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
  const { id } = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-green-900/5 text-center border border-green-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <FiCheckCircle className="text-5xl text-green-600" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Order ID</p>
          <p className="text-xl font-mono font-bold text-gray-900">#{id.slice(-6).toUpperCase()}</p>
        </div>

        <div className="space-y-3">
          <Link 
            href={`/account/orders/${id}`}
            className="block w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
          >
            View Order Details
          </Link>
          
          <Link 
            href="/"
            className="block w-full py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiShoppingBag /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
