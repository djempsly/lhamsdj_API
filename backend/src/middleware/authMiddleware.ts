import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string; email: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Leer token de cookie HttpOnly (prioridad)
    let token = req.cookies?.access_token;

    // 2. Fallback: header Authorization (para apps móviles / Postman)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Acceso no autorizado. Token faltante.' });
    }

    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado.' });
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Requiere privilegios de Administrador.' });
  }
  next();
};

export const requireSupport = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado.' });
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPPORT') {
    return res.status(403).json({ success: false, message: 'Requiere privilegios de Soporte o Admin.' });
  }
  next();
};
