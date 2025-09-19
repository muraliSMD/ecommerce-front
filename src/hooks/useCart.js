"use client";

import { useEffect, useState } from "react";

export function useCart() {
  const [cart, setCart] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCart({ items: Array.isArray(parsed.items) ? parsed.items : [] });
      } catch {
        setCart({ items: [] });
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // Add or update product in cart
const addToCart = (product, quantity = 1, variant = null, isSet = false) => {
  const variantObj = variant
    ? product.variants?.find(
        (v) => v._id === variant._id || (v.color === variant.color && v.size === variant.size)
      )
    : null;

  const itemPrice = variantObj?.price ?? product.price;
  const maxStock = variantObj?.stock ?? product.stock ?? Infinity;

  setCart((prev) => {
    const items = [...prev.items];
    const index = items.findIndex(
      (i) =>
        i.product._id === product._id &&
        ((variantObj && i.variant?._id === variantObj._id) || (!variantObj && !i.variant))
    );

    console.log("=== addToCart called ===");
    console.log("Product:", product.name);
    console.log("Variant:", variantObj ? `${variantObj.color} ${variantObj.size}` : "No variant");
    console.log("Quantity requested:", quantity);
    console.log("Is set directly:", isSet);
    console.log("Previous cart items:", prev.items);

    if (index > -1) {
      let newQty;
      if (isSet) {
        newQty = Math.min(Math.max(quantity, 0), maxStock); // directly set quantity
      } else {
        newQty = Math.min(Math.max(items[index].quantity + quantity, 0), maxStock); // add to existing
      }

      console.log("Previous quantity:", items[index].quantity);
      console.log("New quantity after update:", newQty);

      if (newQty === 0) items.splice(index, 1);
      else items[index].quantity = newQty;
    } else if (quantity > 0) {
      console.log("Adding new item to cart");
      items.push({
        product,
        quantity: Math.min(Number(quantity), maxStock),
        variant: variantObj ? { ...variantObj, price: itemPrice } : null,
      });
    }

    console.log("Updated cart items:", items);
    console.log("=======================");

    return { items };
  });
};



  const removeFromCart = (product, variant = null) => {
    setCart((prev) => ({
      items: prev.items.filter(
        (i) =>
          !(
            i.product._id === product._id &&
            ((variant && i.variant?._id === variant._id) || (!variant && !i.variant))
          )
      ),
    }));
  };

  const clearCart = () => setCart({ items: [] });

  return { cart, isLoading, addToCart, removeFromCart, clearCart };
}
