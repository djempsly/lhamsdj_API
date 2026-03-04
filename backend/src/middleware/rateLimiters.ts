import rateLimit from 'express-rate-limit';
import { t } from '../i18n/t';

/**
 * Rate limit por email cuando el body incluye email (login, register, forgot-password).
 * Mismo email desde distintas IPs comparte el límite (mitiga credential stuffing distribuido).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req: any) => {
    const email = req.body?.email;
    if (typeof email === 'string' && email.trim()) {
      return `auth:${email.toLowerCase().trim()}`;
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
  },
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyAuth') });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyAuth') });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiPublicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyRequests') });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiPrivateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyRequests') });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyUploads') });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Rate limit por email para forgot/reset password (mismo email = mismo límite). */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req: any) => {
    const email = req.body?.email;
    if (typeof email === 'string' && email.trim()) {
      return `reset:${email.toLowerCase().trim()}`;
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
  },
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyResets') });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
