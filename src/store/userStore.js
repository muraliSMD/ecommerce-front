// store/userStore.js
import { create } from "zustand";

export const useUserStore = create((set) => ({
  token: null,
  userInfo: null,
  login: (token, userInfo) => set({ token, userInfo }),
  logout: () => set({ token: null, userInfo: null }),
}));
