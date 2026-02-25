import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  orderId: z.number().int().positive('ID de orden inválido'),
});
