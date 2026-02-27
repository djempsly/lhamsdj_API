import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function generateCsrfToken(req: Request, res: Response) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf-token', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true, csrfToken: token });
}

export function verifyCsrf(req: Request, _res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const headerToken = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies?.['csrf-token'];
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return next();
  }
  next();
}
