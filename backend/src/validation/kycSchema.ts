import { z } from 'zod';

export const KYC_DOCUMENT_TYPES = ['ID_CARD', 'PASSPORT', 'TAX_ID'] as const;

export const submitKycSchema = z.object({
  documentType: z.enum(KYC_DOCUMENT_TYPES, { message: 'documentType must be ID_CARD, PASSPORT or TAX_ID' }),
  documentUrl: z.string().url('documentUrl must be a valid URL'),
  businessAddressVerified: z.boolean().optional(),
  bankAccountVerified: z.boolean().optional(),
});

export const adminReviewKycSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().max(2000).optional(),
}).refine(
  (data) => data.status !== 'REJECTED' || (data.notes && data.notes.trim().length > 0),
  { message: 'notes required when rejecting KYC', path: ['notes'] }
);

export type SubmitKycInput = z.infer<typeof submitKycSchema>;
export type AdminReviewKycInput = z.infer<typeof adminReviewKycSchema>;
