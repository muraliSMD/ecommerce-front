// src/store/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

  addToCart: (product, qty = 1, variant = null) => {
    set((state) => {
      const items = [...state.items];
      
      // Find existing item
      const index = items.findIndex(
        (i) =>
          i.product._id === product._id &&
          ((i.variant && variant && i.variant.color === variant.color && i.variant.size === variant.size) ||
           (!i.variant && !variant))
      );

      if (index > -1) {
        // Update quantity
        items[index].quantity += qty;

        // Prevent negative quantity
        if (items[index].quantity <= 0) {
          items.splice(index, 1);
        }
      } else if (qty > 0) {
        // Add new item
        items.push({ product, variant, quantity: qty });
      }

      return { items };
    });
  },

  removeFromCart: (product, variant = null) => {
    set((state) => {
      const items = state.items.filter(
        (i) =>
          i.product._id !== product._id ||
          (i.variant && variant && (i.variant.color !== variant.color || i.variant.size !== variant.size)) ||
          (!i.variant && variant)
      );
      return { items };
    });
  },

  clearCart: () => set({ items: [] }),
  setHydrated: () => set({ isHydrated: true }),
}),
{
  name: "cart-storage",
  onRehydrateStorage: () => (state) => {
    state.setHydrated();
  },
}
));
