import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

interface ErrorWithStatus extends Error {
  status?: number;
}

export const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

  logger.error({
    statusCode,
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    requestId: req.requestId,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    requestId: req.requestId,
  });
};
