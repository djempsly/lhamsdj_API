import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/authSchema';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies';
import { verifyCaptcha } from '../utils/captcha';
import { audit, AuditActions } from '../lib/audit';

export const register = async (req: Request, res: Response) => {
  try {
    const { captchaToken, ...fields } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ success: false, message: 'Captcha requerido' });
    }
    const captchaValid = await verifyCaptcha(captchaToken, req.ip);
    if (!captchaValid) {
      return res.status(400).json({ success: false, message: 'Captcha inválido. Intenta de nuevo.' });
    }

    const validatedData = registerSchema.parse(fields);
    const { user, accessToken, refreshToken } = await AuthService.register(validatedData);
    setAuthCookies(res, accessToken, refreshToken);
    await audit({ userId: user.id, action: AuditActions.REGISTER, entity: 'User', entityId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json({ success: true, message: 'Cuenta creada. Revisa tu correo para verificar.' });
  } catch (error: any) {
    if (error.message === 'DUPLICATE_EMAIL') {
      return res.status(200).json({ success: true, message: 'Cuenta creada. Revisa tu correo para verificar.' });
    }
    res.status(400).json({ success: false, message: error.message || error.errors });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const userAgent = req.headers['user-agent'];
    const { user, accessToken, refreshToken } = await AuthService.login(validatedData, userAgent);
    setAuthCookies(res, accessToken, refreshToken);
    await audit({ userId: user.id, action: AuditActions.LOGIN_SUCCESS, entity: 'User', entityId: user.id, ip: req.ip, userAgent });
    res.json({ success: true, user });
  } catch (error: any) {
    await audit({ action: AuditActions.LOGIN_FAILED, entity: 'User', details: error.message, ip: req.ip, userAgent: req.headers['user-agent'] });
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
    await audit({ userId: req.user?.id, action: AuditActions.LOGOUT, entity: 'User', ip: req.ip });
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
