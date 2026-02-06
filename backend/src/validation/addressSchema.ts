import { z } from 'zod';

export const createAddressSchema = z.object({
  street: z.string().min(5, "La calle es obligatoria"),
  city: z.string().min(2, "La ciudad es obligatoria"),
  state: z.string().optional(),
  postalCode: z.string().min(3, "El código postal es obligatorio"),
  country: z.string().min(2, "El país es obligatorio"),
  isDefault: z.boolean().optional()
});

export const updateAddressSchema = z.object({
  street: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().optional(),
  postalCode: z.string().min(3).optional(),
  country: z.string().min(2).optional(),
  isDefault: z.boolean().optional()
});