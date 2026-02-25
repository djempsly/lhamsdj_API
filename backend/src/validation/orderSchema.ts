import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.number().int().positive('Dirección de envío requerida'),
  shippingCost: z.number().min(0).optional(),
  shippingService: z.string().optional(),
  couponCode: z.string().optional(),
});
