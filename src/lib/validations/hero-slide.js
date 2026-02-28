import { z } from "zod";

export const heroSlideSchema = z.object({
  title: z.string().trim().min(2, "Title is too short"),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "Image is required"),
  link: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
