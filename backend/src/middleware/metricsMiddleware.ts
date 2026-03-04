import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpRequestDuration } from '../lib/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const path = req.route?.path ?? req.path;
  const method = req.method;

  res.on('finish', () => {
    const status = res.statusCode;
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method, path: path || req.path, status: String(status) });
    httpRequestDuration.observe({ method, path: path || req.path }, duration);
  });

  next();
}
