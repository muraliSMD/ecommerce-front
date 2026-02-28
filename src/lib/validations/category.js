import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is too short").max(100, "Category name is too long"),
  image: z.string().optional().nullable(),
  parent: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Parent Category ID").optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable(),
});
