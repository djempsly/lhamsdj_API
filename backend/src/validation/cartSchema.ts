import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  productVariantId: z.number().int().optional() // Si manejas tallas/colores
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1")
});