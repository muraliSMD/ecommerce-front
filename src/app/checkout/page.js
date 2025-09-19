"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // default Cash on Delivery

  const total = items.reduce(
    (sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity,
    0
  );

  const handlePlaceOrder = () => {
    if (!name || !address) {
      alert("Please fill in all shipping details.");
      return;
    }
    console.log("Order placed:", {
      name,
      address,
      paymentMethod,
      items,
      total,
    });
    alert("Order placed successfully!");
    clearCart();
  };

  if (!items.length)
    return <p className="text-center mt-8">Your cart is empty</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout", href: "/checkout" },
          ]}
        />

        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Shipping & Payment
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your complete address"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Cart Summary */}
          <div className="w-full md:w-[380px]">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Order Summary
              </h2>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start py-3 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.product.name}
                      </p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          {item.variant.color} {item.variant.size}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {item.quantity} × ₹
                        {item.variant?.price ?? item.product.price}
                      </p>
                    </div>
                    <p className="font-medium text-gray-800">
                      ₹
                      {(
                        item.quantity *
                        (item.variant?.price ?? item.product.price)
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
