import { Request, Response } from 'express';
import { t } from '../i18n/t';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validation/authSchema';
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
  if (errorMessage === 'WRONG_CURRENT_PASSWORD') return t(locale, 'auth.wrongCurrentPassword');
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
    const deviceFingerprint = (req.body as { deviceFingerprint?: string }).deviceFingerprint;
    const result = await AuthService.login(
      { email: validatedData.email, password: validatedData.password, ...(deviceFingerprint && { deviceFingerprint }) },
      userAgent,
      req.ip
    );

    if (result.requires2FA) {
      const isMustEnroll = (result as { mustEnroll2FA?: boolean }).mustEnroll2FA ?? false;
      await audit({ userId: result.user.id, action: AuditActions.LOGIN_SUCCESS, entity: 'User', entityId: result.user.id, ip: req.ip, userAgent, details: isMustEnroll ? '2FA enrollment required' : '2FA required' });

      // If user must enroll 2FA, issue temporary auth cookies so they can call /2fa/setup and /2fa/enable
      if (isMustEnroll) {
        const { generateAccessToken, generateRefreshToken, storeRefreshToken } = await import('../utils/tokens');
        const accessToken = generateAccessToken({ id: result.user.id, role: result.user.role, email: result.user.email });
        const refreshToken = generateRefreshToken();
        await storeRefreshToken(result.user.id, refreshToken, userAgent);
        setAuthCookies(res, accessToken, refreshToken);
      }

      return res.json({
        success: true,
        requires2FA: true,
        mustEnroll2FA: isMustEnroll,
        userId: result.user.id,
        user: { country: result.user.country },
      });
    }

    setAuthCookies(res, result.accessToken!, result.refreshToken!);
    await audit({ userId: result.user.id, action: AuditActions.LOGIN_SUCCESS, entity: 'User', entityId: result.user.id, ip: req.ip, userAgent });
    res.json({
      success: true,
      user: result.user,
      ...((result as { newDevice?: boolean }).newDevice && { newDevice: true }),
    });
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

export const loginVerify2FA = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ success: false, message: t(req.locale, 'auth.invalidRequest') });
    }
    const userAgent = req.headers['user-agent'];
    const { user, accessToken, refreshToken } = await AuthService.loginWith2FA(userId, token, userAgent);
    setAuthCookies(res, accessToken, refreshToken);
    await audit({ userId: user.id, action: AuditActions.LOGIN_SUCCESS, entity: 'User', entityId: user.id, ip: req.ip, userAgent, details: '2FA verified' });
    res.json({ success: true, user });
  } catch (error: any) {
    const msg = error.message === 'INVALID_2FA_CODE' ? t(req.locale, 'auth.invalid2FA') : translateAuthError(req.locale, error.message);
    res.status(401).json({ success: false, message: msg });
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

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: t(req.locale, 'auth.notAuthenticated') });
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await AuthService.changePassword(req.user.id, currentPassword, newPassword);
    clearAuthCookies(res);
    res.json({ success: true, message: t(req.locale, 'auth.passwordUpdated') });
  } catch (error: any) {
    const message = translateAuthError(req.locale, error.message) || error.message;
    const status = error.message === 'WRONG_CURRENT_PASSWORD' ? 401 : 400;
    res.status(status).json({ success: false, message });
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

export const magicLinkRequest = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ success: false, message: t(req.locale, 'auth.invalidRequest') });
    const sent = await AuthService.requestMagicLink(email.trim().toLowerCase(), req.locale);
    res.json({ success: true, message: sent ? t(req.locale, 'auth.checkEmail') : t(req.locale, 'auth.invalidRequest') });
  } catch (e) {
    res.status(500).json({ success: false, message: t(req.locale, 'auth.invalidRequest') });
  }
};

export const magicLinkVerify = async (req: Request, res: Response) => {
  try {
    const token = (req.query.token ?? req.body?.token) as string;
    if (!token) return res.status(400).json({ success: false, message: t(req.locale, 'auth.invalidRequest') });
    const userAgent = req.headers['user-agent'];
    const result = await AuthService.loginWithMagicLink(token, userAgent);
    if (result.requires2FA) {
      return res.json({ success: true, requires2FA: true, mustEnroll2FA: (result as { mustEnroll2FA?: boolean }).mustEnroll2FA, userId: result.user.id, user: { country: result.user.country } });
    }
    setAuthCookies(res, result.accessToken!, result.refreshToken!);
    res.json({ success: true, user: result.user });
  } catch (e: any) {
    const msg = e.name === 'TokenExpiredError' ? t(req.locale, 'auth.verifyLinkExpired') : t(req.locale, 'auth.invalidRequest');
    res.status(400).json({ success: false, message: msg });
  }
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

/** Validate that a redirect URI belongs to an allowed origin (prevents open redirect). */
function isAllowedRedirect(uri: string): boolean {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  allowedOrigins.push(FRONTEND_URL);
  try {
    const parsed = new URL(uri);
    return allowedOrigins.includes(parsed.origin);
  } catch {
    return false;
  }
}

export const oauthGoogleRedirect = async (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID) return res.status(503).json({ success: false, message: 'OAuth no configurado' });
  const requestedRedirect = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : FRONTEND_URL;
  const safeRedirect = isAllowedRedirect(requestedRedirect) ? requestedRedirect : FRONTEND_URL;
  const state = Buffer.from(JSON.stringify({ redirect: safeRedirect })).toString('base64url');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || `${process.env.API_URL || 'http://localhost:4000'}/api/v1/auth/google/callback`)}&response_type=code&scope=openid%20email%20profile&state=${state}`;
  res.redirect(url);
};

export const oauthGoogleCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  if (!code || typeof code !== 'string') return res.redirect(`${FRONTEND_URL}/auth/login?error=no_code`);
  let redirect = FRONTEND_URL;
  try {
    if (state && typeof state === 'string') {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
      if (decoded.redirect && isAllowedRedirect(decoded.redirect)) {
        redirect = decoded.redirect;
      }
    }
  } catch {}
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${apiUrl}/api/v1/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) return res.redirect(`${FRONTEND_URL}/auth/login?error=oauth_failed`);
  const tokens = await tokenRes.json();
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) return res.redirect(`${FRONTEND_URL}/auth/login?error=oauth_failed`);
  const googleUser = await userRes.json();
  const { OAuthService } = await import('../services/oauthService');
  const result = await OAuthService.findOrCreateGoogleUser(googleUser);
  if (!result.user) return res.redirect(`${FRONTEND_URL}/auth/login?error=oauth_failed`);
  if (result.requires2FA) {
    return res.redirect(`${redirect}/auth/login?userId=${result.user.id}&requires2FA=1`);
  }
  const { generateAccessToken, generateRefreshToken, storeRefreshToken } = await import('../utils/tokens');
  const accessToken = generateAccessToken({ id: result.user.id, role: result.user.role, email: result.user.email });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(result.user.id, refreshToken, req.headers['user-agent']);
  setAuthCookies(res, accessToken, refreshToken);
  res.redirect(`${redirect}/auth/oauth-callback`);
};
