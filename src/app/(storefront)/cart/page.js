"use client";

import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import CartItem from "@/components/CartItem";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useState } from "react";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const isHydrated = useCartStore((state) => state.isHydrated);

  const settings = useSettingsStore((state) => state.settings);
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = (product, variant) => {
    setItemToDelete({ product, variant });
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.product, itemToDelete.variant);
      setItemToDelete(null);
    }
  };

  const total = items.reduce(
    (sum, i) => sum + (Number(i.variant?.price ?? i.product.price ?? 0) * i.quantity),
    0
  );

  if (!isHydrated) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (!items.length) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-gray-300">
        <FiShoppingBag size={48} />
      </div>
      <h2 className="text-3xl font-display font-bold">Your cart is empty</h2>
      <p className="text-gray-500">Looks like you haven&apos;t added anything to your cart yet.</p>
      <Link href="/" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-secondary transition-all">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <main className="bg-surface min-h-screen pb-20 pt-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="py-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shopping Cart", href: "/cart" },
            ]}
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={`${item.product._id}-${item.variant?.color}-${item.variant?.size}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CartItem
                    item={item}
                    onRemove={() => handleDeleteClick(item.product, item.variant)}
                    onIncrement={() => addToCart(item.product, 1, item.variant)}
                    onDecrement={() => addToCart(item.product, -1, item.variant)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 sticky top-28">
              <h2 className="text-2xl font-display font-bold mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax & Shipping</span>
                  <span className="text-gray-400 font-medium">Calculated at checkout</span>
                </div>
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Estimated Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-primary hover:bg-secondary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                Checkout Now <FiArrowRight />
              </Link>
              
              <p className="text-center text-xs text-gray-400 mt-6 px-4">
                Prices are in {settings.currency}. Shipping and taxes calculated at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Item?"
        message="Are you sure you want to remove this item from your cart? You'll have to find it again if you change your mind."
        confirmText="Remove Item"
        cancelText="Keep Item"
        type="danger"
      />
    </main>
  );
}

