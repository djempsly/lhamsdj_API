import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'validation.passwordMin')
  .regex(/[A-Z]/, 'validation.passwordUpper')
  .regex(/[a-z]/, 'validation.passwordLower')
  .regex(/[0-9]/, 'validation.passwordNumber')
  .regex(/[\W_]/, 'validation.passwordSymbol');

export const registerSchema = z.object({
  name: z.string().min(2, 'validation.nameTooShort').max(100, 'validation.nameTooLong'),
  email: z.string().email('validation.emailInvalid').max(255),
  password: passwordSchema,
  phone: z.string().min(7, 'validation.phoneMin').max(20),
  country: z.string().min(2).max(2),
});

export const loginSchema = z.object({
  email: z.string().email('validation.emailInvalid'),
  password: z.string().min(1, 'validation.passwordRequired'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('validation.emailInvalid'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('validation.emailInvalid'),
  code: z.string().length(6),
  newPassword: passwordSchema,
});
