"use client";

import { useCartStore } from "@/store/cartStore";
import CartItem from "@/components/CartItem";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const total = items.reduce(
    (sum, i) => sum + (Number(i.variant?.price ?? i.product.price ?? 0) * i.quantity),
    0
  );

  if (!items.length) return <p className="text-center mt-8">Your cart is empty</p>;

  return (
    <>
      <Breadcrumbs />
      <div className="bg-white rounded-xl shadow p-4 space-y-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>

        {items.map((item, index) => (
          <CartItem
            key={`${item.product._id}-${item.variant?.color}-${item.variant?.size}-${index}`}
            item={item}
            onRemove={() => removeFromCart(item.product, item.variant)}
            onIncrement={() => addToCart(item.product, 1, item.variant)}
            onDecrement={() => addToCart(item.product, -1, item.variant)}
          />
        ))}

        <div className="mt-6 text-right font-bold text-lg">
          Total: ₹{total.toLocaleString()}
        </div>

        {/* Checkout Button */}
        <div className="mt-4 text-right">
          <Link
            href="/checkout"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </>
  );
}
