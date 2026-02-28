import { z } from "zod";

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required"),
  supportEmail: z.string().trim().email("Invalid support email"),
  supportPhone: z.string().trim().min(5, "Invalid support phone"),
  address: z.string().trim().min(1, "Address is required"),
  logo: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  currency: z.string().trim().min(1, "Currency is required"),
  taxRate: z.number().min(0, "Tax rate cannot be negative"),
  shippingCharge: z.number().min(0, "Shipping charge cannot be negative"),
  signature: z.string().optional().nullable(),
  paymentMethods: z.object({
    cod: z.boolean(),
    online: z.boolean(),
  }),
  maintenanceMode: z.boolean().default(false),
  seo: z.object({
    metaTitle: z.string().trim().min(1, "Meta title is required"),
    metaDescription: z.string().trim().min(1, "Meta description is required"),
    metaKeywords: z.string().optional().nullable(),
    ogImage: z.string().optional().nullable(),
  }),
  scripts: z.object({
    googleAnalyticsId: z.string().optional().nullable(),
    googleTagManagerId: z.string().optional().nullable(),
    facebookPixelId: z.string().optional().nullable(),
    customHeadScripts: z.string().optional().nullable(),
    customBodyScripts: z.string().optional().nullable(),
  }),
  marketing: z.object({
    showOfferPopup: z.boolean(),
    offerCode: z.string().optional().nullable(),
    offerDiscount: z.string().optional().nullable(),
    showSignupPopup: z.boolean(),
    showChatbot: z.boolean(),
  }),
});
