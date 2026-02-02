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

      setAuthModalOpen: (isOpen, mode = "login") => 
        set({ isAuthModalOpen: isOpen, authMode: mode }),
      
      login: (token, userInfo) => set({ token, userInfo, isAuthModalOpen: false }),
      logout: () => set({ token: null, userInfo: null }),
    }),
    {
      name: "user-storage",
    }
  )
);
