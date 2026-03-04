import { Request, Response, NextFunction } from 'express';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    // CSP estricta: API solo sirve JSON; restringir orígenes para cualquier respuesta HTML de error
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self' data: https:; script-src 'self'; style-src 'self'; connect-src 'self'"
    );
  }

  next();
};
