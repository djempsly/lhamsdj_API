import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5, "La calificación debe ser entre 1 y 5 estrellas"),
  comment: z.string().optional()
});