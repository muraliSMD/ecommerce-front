"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Breadcrumbs from "@/components/Breadcrumbs";
import { motion } from "framer-motion";
import { FiCreditCard, FiTruck, FiCheckCircle, FiShield } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { useUserStore } from "@/store/userStore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const isHydrated = useCartStore((state) => state.isHydrated);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settings = useSettingsStore((state) => state.settings);
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const getCurrencySymbol = useSettingsStore((state) => state.getCurrencySymbol);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity,
    0
  );

  const shippingCost = settings.shippingCharge || 0;
  const taxAmount = (subtotal * (settings.taxRate || 0)) / 100;
  const total = subtotal + shippingCost + taxAmount;

  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setCouponError("");

    try {
        const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: couponCode, cartTotal: subtotal })
        });
        const data = await res.json();

        if (!res.ok) {
            setCouponError(data.message || "Invalid coupon");
            setAppliedCoupon(null);
        } else {
            setAppliedCoupon({
                code: data.code,
                discountAmount: data.discountAmount,
                discountType: data.discountType
            });
            toast.success("Coupon applied!");
        }
    } catch (err) {
        setCouponError("Failed to validate coupon");
    } finally {
        setIsValidatingCoupon(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    try {
        const res = await loadRazorpay();
        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            setIsSubmitting(false);
            return;
        }

        // Create Order on Backend
        const orderRes = await fetch("/api/payment/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: Math.max(0, total - (appliedCoupon?.discountAmount || 0)) }),
        });
        const orderData = await orderRes.json();

        if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
            amount: orderData.amount, // Amount is in paise (e.g. 10000)
            currency: orderData.currency,
            name: "GRABSZY",
            description: "Order Payment",
            image: "https://your-logo-url.com/logo.png",
            order_id: orderData.id,
            handler: async function (response) {
                try {
                    // Verify Payment
                    const verifyRes = await fetch("/api/payment/verification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        toast.success("Payment Successful!");
                        const paymentData = {
                            transactionId: response.razorpay_payment_id,
                            status: "Paid",
                            onlineProvider: "Razorpay"
                        };
                        submitOrderToBackend(paymentData);
                    } else {
                        toast.error("Payment verification failed.");
                        setIsSubmitting(false);
                    }
                } catch (verifyError) {
                        console.error("Verification Error", verifyError);
                        toast.error("Payment verification failed");
                        setIsSubmitting(false);
                }
            },
            prefill: {
                name: name,
                email: "customer@example.com",
                contact: phone,
            },
            theme: {
                color: "#3399cc",
            },
            modal: {
                ondismiss: function() {
                    console.log("Razorpay modal dismissed");
                    setIsSubmitting(false);
                    toast("Payment cancelled");
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response){
                console.error("Payment Failed", response.error);
                toast.error(response.error.description || "Payment Failed");
                setIsSubmitting(false);
        });
        paymentObject.open();

    } catch (error) {
        console.error("Payment Flow Error", error);
        toast.error("Failed to initiate payment");
        setIsSubmitting(false);
    }
  };

  const { userInfo, setAuthModalOpen, token } = useUserStore();

  const handlePlaceOrder = async () => {
    if (!userInfo) {
      toast.error("Please login to place an order");
      setAuthModalOpen(true, "login");
      return;
    }

    if (!name || !address || !phone) {
      toast.error("Please fill in all details.");
      return;
    }

    setIsSubmitting(true);
    
    if (paymentMethod === "Online") {
        await handleRazorpayPayment();
    } else {
        submitOrderToBackend({});
    }
  };

  const submitOrderToBackend = async (extraPaymentInfo = {}) => {
      try {
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
            })),
            paymentInfo: {
                couponCode: appliedCoupon?.code,
                discountAmount: appliedCoupon?.discountAmount,
                ...extraPaymentInfo
            }
            })
        });

        if (response.ok) {
            const data = await response.json();
            toast.success("Order placed successfully!");
            clearCart();
            setOrderId(data._id);
            setIsSuccess(true);
        } else {
            toast.error("Failed to place order.");
        }
      } catch (err) {
          toast.error("Failed to submit order to backend");
      } finally {
          setIsSubmitting(false);
      }
  };

  const { width, height } = useWindowSize();

  if (isSuccess) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 text-center px-4 relative overflow-hidden">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
      
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4 animate-bounce">
        <FiCheckCircle size={48} />
      </div>
      <h2 className="text-5xl font-display font-bold text-gray-900">Order Placed!</h2>
      <p className="text-gray-500 max-w-lg text-lg">
        Thank you for your purchase. Your order ID is <span className="font-bold text-gray-900">#{orderId?.slice(-6).toUpperCase()}</span>.
        We&apos;ll send you a confirmation email shortly.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-md z-10">
         <Link 
            href="/shop" 
            className="flex-1 bg-white border border-gray-200 text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Continue Shopping
         </Link>
         <Link 
            href={`/account/orders/${orderId}`} 
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
         >
            Manage Order
         </Link>
      </div>
    </div>
  );

  if (!isHydrated) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (!items.length) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <h2 className="text-3xl font-display font-bold">Your cart is empty</h2>
      <Link href="/" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-secondary transition-all">
        Back to Shop
      </Link>
    </div>
  );

  return (
    <main className="bg-surface min-h-screen pb-20 pt-32 lg:pt-36">
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
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 relative">
                      <Image 
                        src={item.variant?.images?.[0] || item.product.images?.[0]} 
                        alt={item.product.name} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-400">{item.quantity} × {getCurrencySymbol()}{item.variant?.price ?? item.product.price}</p>
                    </div>
                    <p className="font-bold text-sm">{formatPrice((item.variant?.price ?? item.product.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                 <div className="flex justify-between text-gray-400">
                  <span>Tax ({settings.taxRate}%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-primary font-bold" : ""}>
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                  </span>
                </div>

                {/* Coupon Code Section */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={couponCode} 
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Promo Code" 
                            disabled={appliedCoupon}
                            className="bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white w-full outline-none placeholder:text-gray-500 focus:border-primary transition-all disabled:opacity-50"
                        />
                        <button 
                            onClick={handleApplyCoupon}
                            disabled={isValidatingCoupon || !couponCode || appliedCoupon}
                            className="bg-white text-gray-900 px-4 rounded-xl font-bold text-sm hover:bg-gray-100 disabled:opacity-50 transition-all"
                        >
                            {isValidatingCoupon ? "..." : appliedCoupon ? "Applied" : "Apply"}
                        </button>
                    </div>
                    {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-400 text-sm mt-3">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between text-2xl font-display font-bold pt-4 text-white">
                  <span>Total</span>
                  <span>{formatPrice(Math.max(0, total - (appliedCoupon?.discountAmount || 0)))}</span>
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

