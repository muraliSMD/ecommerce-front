import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().trim().min(3, "Comment is too short").max(1000, "Comment is too long"),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
});
