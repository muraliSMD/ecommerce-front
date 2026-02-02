"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Breadcrumbs from "@/components/Breadcrumbs";
import { motion } from "framer-motion";
import { FiCreditCard, FiTruck, FiCheckCircle, FiShield } from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = items.reduce(
    (sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!name || !address || !phone) {
      toast.error("Please fill in all details.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Logic for placing order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: { name, address, phone },
          paymentMethod,
          items: items.map(i => ({
            product: i.product._id,
            quantity: i.quantity,
            variant: i.variant,
            price: i.variant?.price ?? i.product.price
          }))
        })
      });

      if (response.ok) {
        toast.success("Order placed successfully!");
        clearCart();
        window.location.href = "/";
      } else {
        toast.error("Failed to place order.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items.length) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <h2 className="text-3xl font-display font-bold">Your cart is empty</h2>
      <Link href="/" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-secondary transition-all">
        Back to Shop
      </Link>
    </div>
  );

  return (
    <main className="bg-surface min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="py-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cart", href: "/cart" },
              { label: "Checkout", href: "/checkout" },
            ]}
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FiTruck size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold">Shipping Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                    placeholder="John Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Detailed Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300 min-h-[120px]"
                    placeholder="123 Fashion Street, Suite 456, New York"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FiCreditCard size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
                    paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "COD" ? "border-primary" : "border-gray-300"}`}>
                    {paymentMethod === "COD" && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-400">Pay when you receive</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("Online")}
                  className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
                    paymentMethod === "Online" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "Online" ? "border-primary" : "border-gray-300"}`}>
                    {paymentMethod === "Online" && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-400">Secure Stripe payment</p>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl sticky top-28">
              <h2 className="text-2xl font-display font-bold mb-8">Your Order</h2>
              
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                      <img src={item.variant?.images?.[0] || item.product.images?.[0]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-400">{item.quantity} × ${item.variant?.price ?? item.product.price}</p>
                    </div>
                    <p className="font-bold text-sm">${((item.variant?.price ?? item.product.price) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-primary font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-2xl font-display font-bold pt-4 text-white">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-secondary text-white py-5 rounded-[1.5rem] font-bold mt-10 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Complete Purchase"}
                <FiCheckCircle size={20} />
              </button>

              <div className="flex items-center justify-center gap-2 mt-8 text-gray-500 text-xs">
                <FiShield />
                <span>Your data is protected by industry standard encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

