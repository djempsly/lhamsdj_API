import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[\W_]/, 'Debe contener al menos un símbolo');

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto').max(100, 'El nombre es muy largo'),
  email: z.string().email('Email inválido').max(255),
  password: passwordSchema,
  phone: z.string().min(7).max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: passwordSchema,
});
