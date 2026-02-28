import { Request, Response } from 'express';
import { t } from '../i18n/t';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/authSchema';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies';
import { verifyCaptcha } from '../utils/captcha';
import { audit, AuditActions } from '../lib/audit';

function translateAuthError(locale: string | undefined, errorMessage: string): string {
  if (errorMessage === 'DUPLICATE_EMAIL') return t(locale, 'auth.accountCreated');
  if (errorMessage === 'EMAIL_NOT_VERIFIED') return t(locale, 'auth.emailNotVerified');
  if (errorMessage === 'Credenciales inválidas') return t(locale, 'auth.invalidCredentials');
  if (errorMessage === 'Cuenta desactivada') return t(locale, 'auth.accountDeactivated');
  const lockedMatch = errorMessage.match(/Cuenta bloqueada\. Intenta en (\d+) minutos\./);
  if (lockedMatch?.[1]) return t(locale, 'auth.accountLocked', { minutes: parseInt(lockedMatch[1], 10) });
  const remainingMatch = errorMessage.match(/Credenciales inválidas\. (\d+) intentos restantes\./);
  if (remainingMatch?.[1]) return t(locale, 'auth.invalidRemaining', { remaining: parseInt(remainingMatch[1], 10) });
  if (errorMessage === 'Cuenta bloqueada por demasiados intentos. Intenta en 30 minutos.') return t(locale, 'auth.tooManyAttempts');
  if (errorMessage === 'Solicitud inválida') return t(locale, 'auth.invalidRequest');
  if (errorMessage === 'El código ha expirado') return t(locale, 'auth.codeExpired');
  if (errorMessage === 'Código incorrecto') return t(locale, 'auth.wrongCode');
  if (errorMessage === 'Usuario no encontrado') return t(locale, 'auth.userNotFound');
  return errorMessage;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { captchaToken, ...fields } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ success: false, message: t(req.locale, 'auth.captchaRequired') });
    }
    const captchaValid = await verifyCaptcha(captchaToken, req.ip);
    if (!captchaValid) {
      return res.status(400).json({ success: false, message: t(req.locale, 'auth.captchaInvalid') });
    }

    const validatedData = registerSchema.parse(fields);
    const { user } = await AuthService.register(validatedData, req.locale);
    await audit({ userId: user.id, action: AuditActions.REGISTER, entity: 'User', entityId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json({ success: true, message: t(req.locale, 'auth.accountCreated') });
  } catch (error: any) {
    if (error.message === 'DUPLICATE_EMAIL') {
      return res.status(200).json({ success: true, message: t(req.locale, 'auth.accountCreated') });
    }
    const message = translateAuthError(req.locale, error.message) || error.errors;
    res.status(400).json({ success: false, message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;
    if (!token) {
      return res.status(400).json({ success: false, message: t(req.locale, 'auth.invalidRequest') });
    }
    const result = await AuthService.verifyEmail(token);
    if (result.alreadyVerified) {
      return res.json({ success: true, message: t(req.locale, 'auth.alreadyVerified') });
    }
    res.json({ success: true, message: t(req.locale, 'auth.emailVerified') });
  } catch (error: any) {
    const msg = error.name === 'TokenExpiredError'
      ? t(req.locale, 'auth.verifyLinkExpired')
      : t(req.locale, 'auth.verifyLinkInvalid');
    res.status(400).json({ success: false, message: msg });
  }
};

export const verifyByCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: t(req.locale, 'auth.invalidRequest') });
    }
    const result = await AuthService.verifyByCode(email, code);
    if (result.alreadyVerified) {
      return res.json({ success: true, message: t(req.locale, 'auth.alreadyVerified') });
    }
    res.json({ success: true, message: t(req.locale, 'auth.emailVerified') });
  } catch (error: any) {
    let msg = t(req.locale, 'auth.invalidCode');
    if (error.message === 'CODE_EXPIRED') msg = t(req.locale, 'auth.codeExpired');
    if (error.message === 'USER_NOT_FOUND') msg = t(req.locale, 'auth.userNotFound');
    res.status(400).json({ success: false, message: msg });
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
    const isLocked = error.message?.includes('bloqueada');
    const isNotVerified = error.message === 'EMAIL_NOT_VERIFIED';
    const status = isLocked ? 429 : isNotVerified ? 403 : 401;
    res.status(status).json({
      success: false,
      message: translateAuthError(req.locale, error.message),
      ...(isNotVerified && { code: 'EMAIL_NOT_VERIFIED' }),
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const currentRefreshToken = req.cookies?.refresh_token;
    if (!currentRefreshToken) {
      return res.status(401).json({ success: false, message: t(req.locale, 'auth.noActiveSession') });
    }
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken } = await AuthService.refresh(currentRefreshToken, userAgent);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, message: t(req.locale, 'auth.sessionRenewed') });
  } catch (error: any) {
    clearAuthCookies(res);
    res.status(401).json({ success: false, message: t(req.locale, 'auth.sessionExpired') });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) await AuthService.logout(refreshToken);
    await audit({ userId: req.user?.id, action: AuditActions.LOGOUT, entity: 'User', ip: req.ip });
    clearAuthCookies(res);
    res.json({ success: true, message: t(req.locale, 'auth.sessionClosed') });
  } catch {
    clearAuthCookies(res);
    res.json({ success: true, message: t(req.locale, 'auth.sessionClosed') });
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: t(req.locale, 'auth.notAuthenticated') });
    await AuthService.logoutAll(req.user.id);
    clearAuthCookies(res);
    res.json({ success: true, message: t(req.locale, 'auth.allSessionsClosed') });
  } catch (error: any) {
    const message = translateAuthError(req.locale, error.message) || error.message;
    res.status(500).json({ success: false, message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await AuthService.forgotPassword(email, req.locale);
    res.json({ success: true, message: t(req.locale, 'auth.resetEmailSent') });
  } catch (error: any) {
    const message = translateAuthError(req.locale, error.message) || error.message;
    res.status(400).json({ success: false, message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    await AuthService.resetPassword(validatedData);
    clearAuthCookies(res);
    res.json({ success: true, message: t(req.locale, 'auth.passwordUpdated') });
  } catch (error: any) {
    const message = translateAuthError(req.locale, error.message) || error.message;
    res.status(400).json({ success: false, message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: t(req.locale, 'auth.notAuthenticated') });
    const user = await AuthService.getUserById(req.user.id);
    res.json({ success: true, user });
  } catch (error: any) {
    const message = translateAuthError(req.locale, error.message) || error.message;
    res.status(400).json({ success: false, message });
  }
};
