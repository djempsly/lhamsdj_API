import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  parentId: z.number().optional(), // Para subcategorías
  image: z.string().url().optional()
});

export const updateCategorySchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  parentId: z.number().optional(),
  image: z.string().url().optional()
});