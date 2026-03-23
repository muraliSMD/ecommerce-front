"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FiCheckCircle, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useUserStore } from "@/store/userStore";

export default function CheckoutSuccessPage() {
  const { id } = useParams();
  const { setAuthModalOpen, userInfo } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [orderFriendlyId, setOrderFriendlyId] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fetch order ID for display
    const fetchOrderId = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOrderFriendlyId(data.orderId);
          setOrderEmail(data.shippingAddress?.email || "");
          setIsGuest(!data.user);
        }
      } catch (err) {
        console.error("Failed to fetch order details", err);
      }
    };
    fetchOrderId();

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
  }, [id]);



  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 pb-12 bg-bg-main">
      <div className="max-w-md w-full bg-bg-surface rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-green-900/5 text-center border border-border-main relative z-10">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <FiCheckCircle className="text-5xl text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-text-main mb-2">Order Placed!</h1>
        <p className="text-text-muted mb-8">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <div className="bg-bg-section/50 rounded-2xl p-4 mb-8 border border-border-main">
          <p className="text-sm text-text-muted uppercase tracking-wider font-bold mb-1">Order ID</p>
          <p className="text-xl font-mono font-bold text-text-main">#{orderFriendlyId || id.slice(-6).toUpperCase()}</p>
        </div>

        <div className="space-y-4">
          {!userInfo && isGuest ? (
            <div className="space-y-4">
               <button 
                onClick={() => setAuthModalOpen(true, "signup", orderEmail)}
                className="block w-full py-4 bg-btn-dark text-btn-text rounded-xl font-bold hover:bg-btn-dark-hover transition-all shadow-lg"
              >
                Create Account to Track Order
              </button>
              <p className="text-xs text-text-muted">
                Already have an account? {" "}
                <button 
                  onClick={() => setAuthModalOpen(true, "login", orderEmail)}
                  className="text-primary font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          ) : (
            <Link 
              href={`/account/orders/${id}`}
              className="block w-full py-4 bg-btn-dark text-btn-text rounded-xl font-bold hover:bg-btn-dark-hover transition-all shadow-lg"
            >
              View Order Details
            </Link>
          )}
          
          <Link 
            href="/"
            className="block w-full py-4 bg-bg-surface text-text-main border-2 border-border-main rounded-xl font-bold hover:bg-bg-section/50 transition-colors flex items-center justify-center gap-2"
          >
            <FiShoppingBag /> Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
