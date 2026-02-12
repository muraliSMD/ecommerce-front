import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
  JPY: "¥",
  CNY: "¥",
  AED: "DH ",
  SAR: "SR ",
  PKR: "Rs. ",
  BDT: "৳",
};

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: {
        currency: "USD",
        taxRate: 0,
        shippingCharge: 0,
        siteName: "GRABSZY",
      },
      isLoading: false,

      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/settings");
          set({ settings: data, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch settings:", error);
          set({ isLoading: false });
        }
      },

      getCurrencySymbol: () => {
        const { currency } = get().settings;
        return CURRENCY_SYMBOLS[currency] || "$";
      },

      formatPrice: (amount) => {
        const { currency } = get().settings;
        const symbol = CURRENCY_SYMBOLS[currency] || "$";
        return `${symbol}${Number(amount).toFixed(2)}`;
      }
    }),
    {
      name: "settings-storage",
    }
  )
);
