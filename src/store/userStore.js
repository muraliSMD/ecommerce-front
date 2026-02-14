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
        // Set cookie for server-side auth (next/headers)
        document.cookie = `token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        set({ token, userInfo, isAuthModalOpen: false });
        
        // Sync Cart & Wishlist
        useCartStore.getState().setUserId(userInfo._id);
        useCartStore.getState().syncWithBackend();
        
        useWishlistStore.getState().setUserId(userInfo._id);
        useWishlistStore.getState().syncWithBackend();
      },
      logout: () => {
        // Clear cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
      partialize: (state) => ({ token: state.token, userInfo: state.userInfo }),
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);
