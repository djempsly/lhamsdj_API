import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';
import { t } from '../i18n/t';

interface ErrorWithStatus extends Error {
  status?: number;
}

export const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  const message = statusCode === 500 ? t(req.locale, 'middleware.serverError') : err.message;

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
