import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { t } from '../i18n/t';

export function generateCsrfToken(req: Request, res: Response) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf-token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ success: true, csrfToken: token });
}

/**
 * Verifica el token CSRF para métodos que modifican estado.
 * - GET, HEAD, OPTIONS: no requieren CSRF.
 * - Clientes que usan solo Bearer (sin cookie access_token): se eximen (APIs/móvil).
 * - Resto: debe existir cookie csrf-token y header X-Csrf-Token y coincidir.
 */
export function verifyCsrf(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const hasBearer = (req.headers.authorization ?? '').startsWith('Bearer ');
  const hasCookieAuth = !!req.cookies?.access_token;
  if (hasBearer && !hasCookieAuth) return next();

  const headerToken = (req.headers['x-csrf-token'] ?? '').trim();
  const cookieToken = req.cookies?.['csrf-token'] ?? '';
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: t(req.locale, 'middleware.invalidCsrf'),
    });
  }
  next();
}
