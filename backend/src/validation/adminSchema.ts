import { z } from 'zod';

export const OrderStatus = z.enum([
  'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
]);

export const adminUpdateOrderStatusSchema = z.object({
  status: OrderStatus,
});

export const adminExportQuerySchema = z.object({
  format: z.enum(['csv']).default('csv'),
  limit: z.coerce.number().int().min(1).max(10000).default(5000),
});

export const auditLogQuerySchema = z.object({
  action: z.string().optional(),
  entity: z.string().optional(),
  userId: z.coerce.number().int().positive().optional(),
});

export const vendorStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']),
});

export type AdminUpdateOrderStatus = z.infer<typeof adminUpdateOrderStatusSchema>;
export type AdminExportQuery = z.infer<typeof adminExportQuerySchema>;
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
