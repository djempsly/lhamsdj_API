import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number; // CAMBIO: Ahora es number
        role: string;
        email: string;
      };
    }
  }
}

interface TokenPayload {
  id: number; // CAMBIO: Ahora es number
  role: string;
  email: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso no autorizado. Token faltante.' 
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET no definido");
      return res.status(500).json({ success: false, message: 'Error interno' });
    }

    const decoded = jwt.verify(token as string, secret as string) as unknown as TokenPayload;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado.' });

  // Comparamos con el string "ADMIN" (que coincide con tu Enum)
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Requiere privilegios de Administrador.' });
  }

  next();
};