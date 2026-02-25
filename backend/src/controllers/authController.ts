import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/authSchema';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await AuthService.register(validatedData);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || error.errors });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const userAgent = req.headers['user-agent'];
    const { user, accessToken, refreshToken } = await AuthService.login(validatedData, userAgent);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, user });
  } catch (error: any) {
    const status = error.message.includes('bloqueada') ? 429 : 401;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const currentRefreshToken = req.cookies?.refresh_token;
    if (!currentRefreshToken) {
      return res.status(401).json({ success: false, message: 'No hay sesión activa' });
    }
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken } = await AuthService.refresh(currentRefreshToken, userAgent);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, message: 'Sesión renovada' });
  } catch (error: any) {
    clearAuthCookies(res);
    res.status(401).json({ success: false, message: 'Sesión expirada. Inicia sesión de nuevo.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) await AuthService.logout(refreshToken);
    clearAuthCookies(res);
    res.json({ success: true, message: 'Sesión cerrada' });
  } catch {
    clearAuthCookies(res);
    res.json({ success: true, message: 'Sesión cerrada' });
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
    await AuthService.logoutAll(req.user.id);
    clearAuthCookies(res);
    res.json({ success: true, message: 'Todas las sesiones cerradas' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await AuthService.forgotPassword(email);
    res.json({ success: true, message: 'Si el correo existe, se envió el código.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    await AuthService.resetPassword(validatedData);
    clearAuthCookies(res);
    res.json({ success: true, message: 'Contraseña actualizada. Inicia sesión de nuevo.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
    const user = await AuthService.getUserById(req.user.id);
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
