import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { t } from '../i18n/t';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string; email: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.access_token;

    // Fallback: Authorization header (for mobile apps / Postman)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: t(req.locale, 'middleware.tokenMissing') });
    }

    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ success: false, message: t(req.locale, 'middleware.tokenInvalid') });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, message: t(req.locale, 'auth.notAuthenticated') });
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: t(req.locale, 'middleware.requireAdmin') });
  }
  next();
};

export const requireSupport = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, message: t(req.locale, 'auth.notAuthenticated') });
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPPORT') {
    return res.status(403).json({ success: false, message: t(req.locale, 'middleware.requireSupport') });
  }
  next();
};
