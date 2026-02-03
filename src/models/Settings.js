import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: "GRABSZY" },
  supportEmail: { type: String, default: "support@grabszy.com" },
  
  // Financial Settings
  currency: { type: String, default: "USD" },
  taxRate: { type: Number, default: 0 }, // Percentage
  shippingCharge: { type: Number, default: 0 }, // Flat rate
  
  // Feature Toggles (Extensible)
  maintenanceMode: { type: Boolean, default: false },

  // SEO Settings
  seo: {
    metaTitle: { type: String, default: "GRABSZY - Premium E-commerce" },
    metaDescription: { type: String, default: "Shop the best products at GRABSZY." },
    metaKeywords: { type: String, default: "e-commerce, fashion, electronics" },
    ogImage: { type: String, default: "" },
  },

  // Marketing & Support
  marketing: {
    showOfferPopup: { type: Boolean, default: true },
    offerCode: { type: String, default: "WELCOME10" },
    offerDiscount: { type: String, default: "10% OFF" },
    showSignupPopup: { type: Boolean, default: true },
    showChatbot: { type: Boolean, default: true },
  }
}, { timestamps: true });

// Singleton pattern logic could be handled in service layer, 
// here we just define the schema.
export default mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
