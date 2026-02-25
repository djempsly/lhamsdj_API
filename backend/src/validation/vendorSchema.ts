import { z } from 'zod';

export const registerVendorSchema = z.object({
  businessName: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  taxId: z.string().max(50).optional(),
  country: z.string().min(2).max(100),
  city: z.string().max(100).optional(),
  type: z.enum(['STANDARD', 'DROPSHIP']).optional(),
});

export const updateVendorSchema = z.object({
  businessName: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  logo: z.string().url().optional(),
  taxId: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  bankInfo: z.string().max(500).optional(),
});

export const adminUpdateVendorSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});
