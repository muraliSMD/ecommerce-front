import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      userId: null,

      setUserId: (id) => set({ userId: id }),

      syncWithBackend: async () => {
        const { items, userId } = get();
        if (!userId) return;

        try {
            // 1. Sync local items to server (if any)
            for (const item of items) {
                 await fetch('/api/user/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: item._id }),
                });
            }

            // 2. Fetch latest from server
            const res = await fetch('/api/user/wishlist');
            if (res.ok) {
                const serverItems = await res.json();
                set({ items: serverItems });
            }
        } catch (error) {
            console.error("Failed to sync wishlist:", error);
        }
      },

      addItem: async (product) => {
        const { items, userId } = get();
        const exists = items.find((i) => i._id === product._id);
        
        if (!exists) {
          set({ items: [...items, product] });
          if (userId) {
            try {
                await fetch('/api/user/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product._id }),
                });
            } catch (error) {
                console.error("Failed to add to wishlist backend:", error);
            }
          }
        }
      },

      removeItem: async (productId) => {
        set({ items: get().items.filter((i) => i._id !== productId) });
        const { userId } = get();
        if (userId) {
            try {
                await fetch(`/api/user/wishlist?productId=${productId}`, {
                    method: 'DELETE',
                });
            } catch (error) {
                console.error("Failed to remove from wishlist backend:", error);
            }
        }
      },

      isInWishlist: (productId) => {
        return get().items.some(i => i._id === productId);
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'grabszy-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
