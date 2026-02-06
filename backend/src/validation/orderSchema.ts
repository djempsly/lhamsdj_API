import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.number().int().positive("Debes seleccionar una dirección de envío válida")
});