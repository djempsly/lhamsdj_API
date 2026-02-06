// import { z } from 'zod';

// export const createVariantSchema = z.object({
//   productId: z.number().int().positive(),
//   sku: z.string().min(3),
//   size: z.string().optional(),
//   color: z.string().optional(),
//   stock: z.number().int().min(0),
//   price: z.number().min(0)
// });



import { z } from 'zod';

export const createVariantSchema = z.object({
  productId: z.number().int().positive(),
  sku: z.string().min(3, "El SKU es obligatorio y único"),
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.number().int().min(0),
  price: z.number().min(0) // Precio específico de la variante
});

// Para actualizar stock o precio de una variante existente
export const updateVariantSchema = z.object({
  sku: z.string().min(3).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  price: z.number().min(0).optional()
});

