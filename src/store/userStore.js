// store/userStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "./cartStore";
import { useWishlistStore } from "./wishlistStore";

export const useUserStore = create(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      isAuthModalOpen: false,
      authMode: "login", // "login" | "signup"

      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),

      setAuthModalOpen: (isOpen, mode = "login") => 
        set({ isAuthModalOpen: isOpen, authMode: mode }),
      
      login: (userInfo, token) => {
        // Cookie is now set by the server (HttpOnly)
        set({ token, userInfo, isAuthModalOpen: false });
        
        // Sync Cart & Wishlist
        useCartStore.getState().setUserId(userInfo._id);
        useCartStore.getState().syncWithBackend();
        
        useWishlistStore.getState().setUserId(userInfo._id);
        useWishlistStore.getState().syncWithBackend();
      },
      logout: async () => {
        try {
            await fetch('/api/users/logout', { method: 'POST' });
        } catch (err) {
            console.error("Logout failed", err);
        }
        
        set({ token: null, userInfo: null });

        // Clear/Reset Cart & Wishlist User State
        useCartStore.getState().setUserId(null);
        useCartStore.getState().clearCart(); 
        
        useWishlistStore.getState().setUserId(null);
        useWishlistStore.getState().clearWishlist();
      },
    }),
    {
      name: "user-storage",
      version: 1,
      partialize: (state) => ({ userInfo: state.userInfo }),
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);
