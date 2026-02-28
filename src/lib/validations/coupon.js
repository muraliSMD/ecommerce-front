import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().trim().min(2, "Coupon code is too short").toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscountAmount: z.number().optional().nullable(),
  isActive: z.boolean().default(true),
  expiryDate: z.string().optional().nullable().or(z.date()),
  usageLimit: z.number().int().positive().optional().nullable(),
});
