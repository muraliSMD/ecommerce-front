// store/userStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      },
      logout: () => {
        // Clear cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        set({ token: null, userInfo: null });
      },
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);
