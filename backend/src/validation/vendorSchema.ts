import { z } from 'zod';

export const registerVendorSchema = z.object({
  // Frontend-friendly aliases
  storeName: z.string().min(2).max(100).optional(),
  storeSlug: z.string().min(2).max(100).optional(),
  // Original fields (for backwards compatibility)
  businessName: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  taxId: z.string().max(50).optional(),
  country: z.string().min(2).max(100).optional().default('Global'),
  city: z.string().max(100).optional(),
  type: z.enum(['STANDARD', 'DROPSHIP']).optional(),
}).refine(
  (data) => data.storeName || data.businessName,
  { message: 'storeName or businessName is required', path: ['storeName'] }
);

export const updateVendorSchema = z.object({
  businessName: z.string().min(2).max(100).optional(),
  storeName: z.string().min(2).max(100).optional(), // alias for businessName
  description: z.string().max(2000).optional(),
  logo: z.string().url().optional(),
  logoUrl: z.string().url().optional(), // alias for logo
  taxId: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  bankInfo: z.string().max(500).optional(),
});

export const adminUpdateVendorSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});
