import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;
        const exists = currentItems.find((i) => i._id === product._id);
        if (!exists) {
          set({ items: [...currentItems, product] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i._id !== productId) });
      },
      isInWishlist: (productId) => {
        return get().items.some(i => i._id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'grabszy-wishlist',
    }
  )
);
