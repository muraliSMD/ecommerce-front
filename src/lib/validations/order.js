import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number is required"),
  address1: z.string().min(2, "Address line 1 is required"),
  address2: z.string().optional().nullable().or(z.literal("")),
  address3: z.string().optional().nullable().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  state: z.string().optional().nullable().or(z.literal("")),
  pincode: z.string().min(4, "Pincode is required"),
  landmark: z.string().optional().nullable().or(z.literal("")),
  label: z.string().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable().or(z.literal("")) // Legacy fallback
});

export const orderItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  variant: z.object({
    color: z.string().optional(),
    size: z.string().optional()
  }).nullable().optional(),
  price: z.number().positive()
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["COD", "Online", "Stripe", "Razorpay"]),
  shippingCharge: z.number().optional().default(0),
  taxAmount: z.number().optional().default(0),
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty").optional(), // Items might be optional if using DB cart fallback
  paymentInfo: z.object({
    couponCode: z.string().optional(),
    discountAmount: z.number().optional(),
    transactionId: z.string().optional(),
    status: z.string().optional(),
    onlineProvider: z.string().optional()
  }).optional()
});
