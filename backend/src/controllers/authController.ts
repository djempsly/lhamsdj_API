import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/authSchema';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body); // Validar con Zod
    const result = await AuthService.register(validatedData);
    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    // Si es error de Zod, devolvemos 400, si no 500 o mensaje del servicio
    res.status(400).json({ success: false, message: error.message || error.errors });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedData);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await AuthService.forgotPassword(email);
    // Siempre respondemos positivo por seguridad
    res.json({ success: true, message: 'Si el correo existe, se envió el código.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    await AuthService.resetPassword(validatedData);
    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};