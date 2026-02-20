// src/store/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      userId: null, // Track user login status

      setUserId: (id) => set({ userId: id }),

      syncWithBackend: async () => {
        const { items, userId } = get();
        if (!userId) return;

        try {
            // First push local items to merge
            if (items.length > 0) {
                 await fetch('/api/user/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartItems: items }),
                });
            }
            
            // Then fetch latest state
            const res = await fetch('/api/user/cart');
            if (res.ok) {
                const serverCart = await res.json();
                // Map server cart to local structure
                const mappedItems = serverCart.map(item => ({
                    product: item.product,
                    quantity: item.quantity,
                    variant: item.variant
                }));
                set({ items: mappedItems });
            }
        } catch (error) {
            console.error("Failed to sync cart:", error);
        }
      },

      addToCart: async (product, qty = 1, variant = null) => {
        const { userId } = get();
        
        const currentStock = variant ? variant.stock : product.stock;

        set((state) => {
          const items = [...state.items];
          
          // Helper to check if variant is "empty" (null, undefined, or empty object)
          const isEmptyVariant = (v) => !v || Object.keys(v).length === 0;
          
          const index = items.findIndex(
            (i) =>
              i.product._id === product._id &&
              (
                // Both have variants and they match
                (!isEmptyVariant(i.variant) && !isEmptyVariant(variant) && 
                 i.variant.color === variant.color && 
                 i.variant.size === variant.size &&
                 i.variant.length === variant.length) ||
                // Both are empty/null variants
                (isEmptyVariant(i.variant) && isEmptyVariant(variant))
              )
          );

          if (index > -1) {
            const newQuantity = items[index].quantity + qty;
            if (newQuantity > currentStock) {
                // Determine how many can be added
                const remaining = Math.max(0, currentStock - items[index].quantity);
                if (remaining > 0) {
                     items[index].quantity += remaining;
                     toast.error(`Only ${remaining} more available in stock`);
                } else {
                     toast.error("Max quantity reached");
                }
            } else {
                items[index].quantity += qty;
            }
            
            // Prevent negative quantity
            if (items[index].quantity <= 0) items.splice(index, 1);
          } else if (qty > 0) {
             // New item
             if (qty > currentStock) {
                 items.push({ 
                    product, 
                    variant: isEmptyVariant(variant) ? null : variant, 
                    quantity: currentStock // Clamp to max stock
                });
                toast.error(`Only ${currentStock} available in stock`);
             } else {
                items.push({ 
                    product, 
                    variant: isEmptyVariant(variant) ? null : variant, 
                    quantity: qty 
                });
             }
          }

          return { items };
        });

        if (userId) {
             await fetch('/api/user/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItems: [{ product, quantity: qty, variant }] }), 
            });
        }
      },

      removeFromCart: async (product, variant = null) => {
        const { userId } = get();
        set((state) => {
          const items = state.items.filter(
            (i) =>
              i.product._id !== product._id ||
              (i.variant && variant && (
                  i.variant.color !== variant.color || 
                  i.variant.size !== variant.size ||
                  i.variant.length !== variant.length
              )) ||
              (i.variant && !variant) ||
              (!i.variant && variant)
          );
          return { items };
        });
        
        if (userId) {
             await fetch('/api/user/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, quantity: 0, variant }),
            });
        }
      },

      clearCart: () => set({ items: [] }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
