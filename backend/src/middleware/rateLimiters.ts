import rateLimit from 'express-rate-limit';
import { t } from '../i18n/t';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
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

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req: any, res: any) => {
    res.status(429).json({ success: false, message: t(req.locale, 'middleware.tooManyResets') });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
