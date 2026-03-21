import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().trim().min(2, "Coupon code is too short").toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive("Value must be positive"),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxDiscountAmount: z.coerce.number().optional().nullable(),
  isActive: z.boolean().default(true),
  expiryDate: z.string().optional().nullable().or(z.date()),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
});
