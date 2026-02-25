import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
  profileImage: z.string().url().optional(),
  password: z.string().min(8).optional(),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser un número'),
});
