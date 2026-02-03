import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true }, // 10 for 10% or $10
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number }, // Cap for percentage discounts
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date },
    usageLimit: { type: Number, default: null }, // infinite if null
    usedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);