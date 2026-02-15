import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    couponCode: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  },
  { timestamps: true }
);

// Prevent same user from using same coupon twice
couponUsageSchema.index({ userId: 1, couponCode: 1 }, { unique: true });

export default mongoose.models.CouponUsage || mongoose.model("CouponUsage", couponUsageSchema);
