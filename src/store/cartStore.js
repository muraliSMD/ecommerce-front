// src/store/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
        
        set((state) => {
          const items = [...state.items];
          const index = items.findIndex(
            (i) =>
              i.product._id === product._id &&
              ((i.variant && variant && i.variant.color === variant.color && i.variant.size === variant.size) ||
               (!i.variant && !variant))
          );

          if (index > -1) {
            items[index].quantity += qty;
            if (items[index].quantity <= 0) items.splice(index, 1);
          } else if (qty > 0) {
            items.push({ product, variant, quantity: qty });
          }

          return { items };
        });

        if (userId) {
             const { items } = get();
             await fetch('/api/user/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItems: [{ product, quantity: qty, variant }] }), 
                // Note: The API handles specific item merge or full sync. 
                // For efficiency, ideally we send just the update or use PUT.
                // Re-using POST as "merge" is safe but maybe heavy. 
                // Let's stick to efficient sync call or just fire-and-forget the merge?
                // The syncWithBackend does a full fetch. 
                // Let's call syncWithBackend to ensure consistency or just manual fetch?
                // To keep it responsive, we updated local state first.
                // Let's trigger a background sync.
            });
            // Optimization: We could just send the delta, but ensuring consistency is key.
            // Let's trigger a fetch to be sure.
            // get().syncWithBackend(); 
        }
      },

      removeFromCart: async (product, variant = null) => {
        const { userId } = get();
        set((state) => {
          const items = state.items.filter(
            (i) =>
              i.product._id !== product._id ||
              (i.variant && variant && (i.variant.color !== variant.color || i.variant.size !== variant.size)) ||
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
