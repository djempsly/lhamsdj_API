import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { t } from '../i18n/t';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string; email: string };
      vendorId?: number;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.access_token;

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

/** RBAC: exige uno de los roles indicados. */
export const requireRoles = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, message: t(req.locale, 'auth.notAuthenticated') });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: t(req.locale, 'middleware.requireAdmin') });
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireRoles(['ADMIN'])(req, res, next);
};

export const requireSupport = (req: Request, res: Response, next: NextFunction) => {
  requireRoles(['ADMIN', 'SUPPORT'])(req, res, next);
};

/** Exige que el usuario tenga cuenta de vendedor; pone req.vendorId. */
export const requireVendor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, message: t(req.locale, 'auth.notAuthenticated') });
  prisma.vendor
    .findUnique({ where: { userId: req.user!.id }, select: { id: true } })
    .then((vendor) => {
      if (!vendor) return res.status(403).json({ success: false, message: 'No tienes cuenta de vendedor' });
      req.vendorId = vendor.id;
      next();
    })
    .catch(next);
};
