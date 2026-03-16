import rateLimit from 'express-rate-limit';
import { t } from '../i18n/t';

/**
 * Normalise an IP for use as a rate-limit key.
 * Strips the ::ffff: prefix from IPv4-mapped IPv6 addresses so that
 * 127.0.0.1 and ::ffff:127.0.0.1 share the same bucket.
 */
function normaliseIp(req: { ip?: string; socket?: { remoteAddress?: string } }): string {
  const raw = req.ip || req.socket?.remoteAddress || 'unknown';
  return raw.replace(/^::ffff:/, '');
}

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
    return normaliseIp(req);
  },
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyAuth') });
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
});

/** Login estricto: 5 intentos por minuto por IP/email (anti brute-force). */
export const authStrictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  keyGenerator: (req: any) => {
    const email = req.body?.email;
    if (typeof email === 'string' && email.trim()) {
      return `login:${email.toLowerCase().trim()}`;
    }
    return normaliseIp(req);
  },
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyAuth') });
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
});

/** Creación de cuenta: 3 por hora por IP (anti bulk accounts). */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req: any) => normaliseIp(req),
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyRequests') });
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
});

/** Checkout: 3 por minuto por usuario (anti fraude velocity). */
export const checkoutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  keyGenerator: (req: any) => {
    const uid = (req as any).user?.id;
    return uid ? `checkout:${uid}` : normaliseIp(req);
  },
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyRequests') });
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
});

/** Búsqueda: 60 por minuto por IP. */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  keyGenerator: (req: any) => normaliseIp(req),
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyRequests') });
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
});

/** API vendedor: 100 req/min por usuario. */
export const apiVendorLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  keyGenerator: (req: any) => {
    const uid = (req as any).user?.id;
    return uid ? `vendor:${uid}` : normaliseIp(req);
  },
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyRequests') });
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
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
    return normaliseIp(req);
  },
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyResets') });
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false },
});
