"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import Breadcrumbs from "@/components/Breadcrumbs";
import { motion, AnimatePresence } from "framer-motion";
import { FiCreditCard, FiTruck, FiCheckCircle, FiShield, FiTag, FiX, FiPlus, FiHome, FiBriefcase, FiMapPin, FiEdit2, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { useUserStore } from "@/store/userStore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const isHydrated = useCartStore((state) => state.isHydrated);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const [formData, setFormData] = useState({
     name: "",
     email: "",
     phone: "",
     address1: "",
     address2: "",
     address3: "",
     city: "",
     state: "",
     pincode: "",
     landmark: "",
     label: "Home"
  });

  // Derived state for back-compat if needed, or just use selected address
  const selectedAddress = addresses.find(a => a._id === selectedAddressId);
  // Default to form data if no address selected (guest or new address)
  const billingDetail = selectedAddress || formData; 
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settings = useSettingsStore((state) => state.settings);
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const getCurrencySymbol = useSettingsStore((state) => state.getCurrencySymbol);
  const { userInfo, setAuthModalOpen, token } = useUserStore();

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity,
    0
  );

  const shippingCost = settings.shippingCharge || 0;
  const taxAmount = (subtotal * (settings.taxRate || 0)) / 100;
  const total = subtotal + shippingCost + taxAmount;



  // Fetch Available Coupons
  const { data: availableCoupons } = useQuery({
    queryKey: ["available-coupons", userInfo?._id], // Refetch when user changes
    queryFn: async () => {
        // Only fetch if user is logged in, otherwise empty list (or could fetch public coupons)
        // Adjust API to handle public coupons if needed, but for now assuming user-specific logic is key
        const { data } = await api.get("/coupons?available=true");
        return data;
    },
    enabled: !!userInfo, // Only fetch if logged in
  });

  // Fetch User Addresses
  const { data: userAddresses, refetch: refetchAddresses } = useQuery({
    queryKey: ["user-addresses", userInfo?._id],
    queryFn: async () => {
        const { data } = await api.get("/user/addresses?limit=100"); // Ensure we get all
        return data;
    },
    enabled: !!userInfo,
  });

  useEffect(() => {
    if (userAddresses) {
        setAddresses(userAddresses);
        if (userAddresses.length > 0) {
            if (!selectedAddressId) {
                const defaultAddr = userAddresses.find(a => a.isDefault);
                setSelectedAddressId(defaultAddr ? defaultAddr._id : userAddresses[0]._id);
            }
            setShowAddressForm(false);
        } else {
            setShowAddressForm(true);
        }
    }
  }, [userAddresses, selectedAddressId]);

  // Update payment method based on settings
  useEffect(() => {
     if (settings.paymentMethods) {
         const codEnabled = settings.paymentMethods.cod ?? true;
         const onlineEnabled = settings.paymentMethods.online ?? true;

         if (!codEnabled && paymentMethod === 'COD') {
             if (onlineEnabled) setPaymentMethod('Online');
             else setPaymentMethod(""); // Both disabled
         }
         
         if (!onlineEnabled && paymentMethod === 'Online') {
             if (codEnabled) setPaymentMethod('COD');
             else setPaymentMethod("");
         }
     }
  }, [settings.paymentMethods, paymentMethod]);

  const handleInputChange = (e) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
      // Basic validation
      if(!formData.name || !formData.phone || !formData.address1 || !formData.city || !formData.pincode) {
          toast.error("Please fill required fields");
          return;
      }

      setIsSubmitting(true);
      try {
          const { data } = await api.post("/user/addresses", formData);
          setAddresses(data);
          setShowAddressForm(false);
          // Set the newly created address as selected (it's the last one usually, or logic in route handles default)
          // Ideally the route returns the updated list.
          const newAddr = data[data.length - 1]; // Assuming appended
          setSelectedAddressId(newAddr._id);
          toast.success("Address saved!");
      } catch (err) {
          toast.error("Failed to save address");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleApplyCoupon = async (codeOverride = null) => {
    const codeToUse = codeOverride || couponCode;
    if (!codeToUse) return;
    
    setIsValidatingCoupon(true);
    setCouponError("");

    try {
        const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: codeToUse, cartTotal: subtotal })
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
            setCouponCode(data.code); // Update input if applied from list
            toast.success("Coupon applied!");
            setIsCouponsModalOpen(false);
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
                name: billingDetail.name,
                email: billingDetail.email || userInfo?.email,
                contact: billingDetail.phone,
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

  const handlePlaceOrder = async () => {
    // Guest checkout allowed
    // if (!userInfo) {
    //   toast.error("Please login to place an order");
    //   setAuthModalOpen(true, "login");
    //   return;
    // }

    const hasLegacyAddress = !!billingDetail.address;
    const hasNewAddress = billingDetail.address1 && billingDetail.city && billingDetail.pincode;

    if (!billingDetail.name || (!hasLegacyAddress && !hasNewAddress)) {
      toast.error("Please fill in all shipping details or select an address.");
      return;
    }

    setIsSubmitting(true);
    
    if (paymentMethod === "Online") {
        await handleRazorpayPayment();
    } else {
        submitOrderToBackend({});
    }
  };

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const submitOrderToBackend = async (extraPaymentInfo = {}) => {
      try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            shippingAddress: {
                name: billingDetail.name,
                email: billingDetail.email || "",
                phone: billingDetail.phone,
                address1: billingDetail.address1,
                address2: billingDetail.address2 || "",
                address3: billingDetail.address3 || "",
                city: billingDetail.city,
                state: billingDetail.state || "",
                pincode: billingDetail.pincode,
                landmark: billingDetail.landmark || "",
                label: billingDetail.label || "Home",
                address: billingDetail.address || (billingDetail.address1 ? `${billingDetail.address1}, ${billingDetail.address2}, ${billingDetail.city}, ${billingDetail.pincode}` : "")
            },
            paymentMethod,
            shippingCharge: shippingCost,
            taxAmount: taxAmount,
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
            setIsOrderPlaced(true); // SET THIS BEFORE CLEARING CART
            toast.success("Order placed successfully!");
            clearCart();
            router.push(`/checkout/success/${data._id}`);
        } else {
            const data = await response.json();
            toast.error(data.message || "Failed to place order.");
            setIsSubmitting(false); // Only reset if failed
        }
      } catch (err) {
          toast.error("Failed to submit order to backend");
          setIsSubmitting(false);
      } 
      // Do not reset submitting in finally if success, to prevent UI flicker
  };

  const { width, height } = useWindowSize();



  if (!isHydrated) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (!items.length && !isOrderPlaced) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <h2 className="text-3xl font-display font-bold">Your cart is empty</h2>
      <Link href="/" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-secondary transition-all">
        Back to Shop
      </Link>
    </div>
  );

  return (
    <main className="bg-surface min-h-screen pb-8 md:pb-12 pt-24 md:pt-28 lg:pt-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="py-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cart", href: "/cart" },
              { label: "Checkout", href: "/checkout" },
            ]}
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <motion.section 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <FiTruck size={24} />
                    </div>
                    <h2 className="text-2xl font-display font-bold">Shipping Details</h2>
                </div>
                {!showAddressForm && addresses.length > 0 && (
                     <button 
                        onClick={() => {
                            setShowAddressForm(true);
                            setFormData({
                                name: "", email: "", phone: "", address1: "", address2: "", address3: "", city: "", state: "", pincode: "", landmark: "", label: "Home"
                            });
                        }}
                        className="flex items-center gap-2 text-primary font-bold hover:underline"
                     >
                        <FiPlus /> Add New
                     </button>
                )}
              </div>

              {!showAddressForm && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                          <div 
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`border-2 rounded-2xl p-5 cursor-pointer transition-all relative ${
                                selectedAddressId === addr._id 
                                ? "border-primary bg-primary/5" 
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                                <div className="flex items-center gap-2 mb-2">
                                    {(addr.label === "Home" || !addr.label) && <FiHome className="text-primary" />}
                                    {addr.label === "Office" && <FiBriefcase className="text-primary" />}
                                    {!["Home", "Office", "", undefined].includes(addr.label) && <FiMapPin className="text-primary" />}
                                    <span className="font-bold text-gray-900">{addr.label || "Address"}</span>
                                    {addr.isDefault && <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Default</span>}
                                </div>
                                <p className="font-bold text-gray-900 pr-8">{addr.name}</p>
                                
                                {addr.address1 ? (
                                    <>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {addr.address1}
                                            {addr.address2 ? `, ${addr.address2}` : ""}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {addr.city}
                                            {addr.state ? `, ${addr.state}` : ""} 
                                            {addr.pincode ? ` - ${addr.pincode}` : ""}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 mt-1">{addr.address}</p>
                                )}
                                
                                <p className="text-sm text-gray-500 mt-2">{addr.phone}</p>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="john@example.com"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Address Line 1 *</label>
                                <input
                                    type="text"
                                    name="address1"
                                    value={formData.address1}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="House No, Building Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Address Line 2</label>
                                <input
                                    type="text"
                                    name="address2"
                                    value={formData.address2}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Street, Area"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Address Line 3</label>
                                <input
                                    type="text"
                                    name="address3"
                                    value={formData.address3}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Landmark (Optional)"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="New York"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="NY"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pincode *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="10001"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Landmark</label>
                                <input
                                    type="text"
                                    name="landmark"
                                    value={formData.landmark}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Near Central Park"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Address Type</label>
                                <div className="flex gap-4">
                                    {["Home", "Office", "Other"].map(label => (
                                        <button
                                            key={label}
                                            onClick={() => setFormData({...formData, label})}
                                            className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${
                                                formData.label === label 
                                                ? "border-primary bg-primary text-white" 
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSaveAddress}
                                disabled={isSubmitting}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : "Save Address"}
                            </button>
                            {addresses.length > 0 && (
                                <button
                                    onClick={() => setShowAddressForm(false)}
                                    className="text-gray-500 font-bold hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                  </div>
              )}
            </motion.section>

            <motion.section 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4, delay: 0.1 }}
               className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FiCreditCard size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(settings.paymentMethods?.cod ?? true) && (
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
                )}

                {(settings.paymentMethods?.online ?? true) && (
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
                )}

                {(!items.length || (!(settings.paymentMethods?.cod ?? true) && !(settings.paymentMethods?.online ?? true))) && (
                     <div className="col-span-2 p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-bold">
                        No payment methods available. Please contact support.
                     </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4, delay: 0.2 }}
               className="bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl sticky top-28"
            >
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
                            className="bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white w-full outline-none placeholder:text-gray-500 focus:border-primary transition-all disabled:opacity-50 uppercase font-mono"
                        />
                        <button 
                            onClick={() => handleApplyCoupon()}
                            disabled={isValidatingCoupon || !couponCode || appliedCoupon}
                            className="bg-white text-gray-900 px-4 rounded-xl font-bold text-sm hover:bg-gray-100 disabled:opacity-50 transition-all"
                        >
                            {isValidatingCoupon ? "..." : appliedCoupon ? "Applied" : "Apply"}
                        </button>
                    </div>
                    
                    {/* View Offers Button */}
                     {userInfo && availableCoupons?.length > 0 && !appliedCoupon && (
                        <button
                          onClick={() => setIsCouponsModalOpen(true)}
                          className="text-primary text-xs font-bold mt-2 hover:underline flex items-center gap-1"
                        >
                          <FiTag /> View Available Offers ({availableCoupons.length})
                        </button>
                     )}
                     
                     {!userInfo && (
                        <button
                          onClick={() => setAuthModalOpen(true, "login")}
                          className="text-primary text-xs font-bold mt-2 hover:underline flex items-center gap-1"
                        >
                          <FiTag /> Login to see available offers
                        </button>
                     )}

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
            </motion.div>
          </div>
        </div>
        
        {/* Coupons Modal */}
        <AnimatePresence>
            {isCouponsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsCouponsModalOpen(false)}
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-[2rem] p-6 max-w-md w-full relative z-10 max-h-[80vh] overflow-hidden flex flex-col"
                    >
                         <button 
                            onClick={() => setIsCouponsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                         >
                            <FiX />
                         </button>

                         <h3 className="text-2xl font-display font-bold mb-1">Available Coupons</h3>
                         <p className="text-gray-500 text-sm mb-6">Select a coupon to apply to your order.</p>

                         <div className="space-y-4 overflow-y-auto pr-2">
                            {availableCoupons?.sort(a => a.minOrderAmount > subtotal ? 1 : -1).map(coupon => {
                                const isEligible = subtotal >= coupon.minOrderAmount;
                                
                                return (
                                <div 
                                    key={coupon._id} 
                                    className={`border rounded-2xl p-4 flex flex-col gap-2 transition-all ${
                                        isEligible 
                                        ? "border-primary/20 bg-primary/5 hover:border-primary" 
                                        : "border-gray-100 bg-gray-50 opacity-60"
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-mono font-bold bg-white border border-dashed border-gray-300 px-2 py-1 rounded text-primary text-sm uppercase tracking-wider">
                                                {coupon.code}
                                            </span>
                                            <h4 className="font-bold text-gray-900 mt-2">
                                                {coupon.discountType === 'percentage' 
                                                ? `${coupon.value}% OFF` 
                                                : `${formatPrice(coupon.value)} OFF`
                                                }
                                            </h4>
                                        </div>
                                        {isEligible ? (
                                             <button
                                                onClick={() => handleApplyCoupon(coupon.code)}
                                                className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                                             >
                                                Apply
                                             </button>
                                        ) : (
                                            <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-lg">
                                                Min {formatPrice(coupon.minOrderAmount)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        expires {coupon.expiryDate ? format(new Date(coupon.expiryDate), "MMM dd") : "Never"} • 
                                        Min order {formatPrice(coupon.minOrderAmount)}
                                    </p>
                                </div>
                            )})}
                            
                            {availableCoupons?.length === 0 && (
                                <p className="text-center text-gray-400 py-4">No coupons available at the moment.</p>
                            )}
                         </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </main>
  );
}


