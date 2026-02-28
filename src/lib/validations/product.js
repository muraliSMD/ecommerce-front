import { z } from "zod";

export const variantSchema = z.object({
  color: z.string().min(1, "Color is required"),
  size: z.string().optional().nullable(),
  length: z.string().optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  price: z.number().positive("Price must be positive"),
  mrp: z.number().optional().nullable(),
  discount: z.number().min(0).max(100).optional().nullable(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is too short").max(200, "Product name is too long"),
  sku: z.string().trim().optional().nullable(),
  description: z.string().optional().nullable(),
  manufacturerInfo: z.string().optional().nullable(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID").optional().nullable(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  price: z.number().positive("Price must be positive"),
  mrp: z.number().optional().nullable(),
  discount: z.number().min(0).max(100).optional().nullable(),
  hasVariants: z.boolean().default(false),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  variants: z.array(variantSchema).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  metaKeywords: z.string().max(200).optional().nullable(),
});
