import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import logger from '../lib/logger';
import { t } from '../i18n/t';

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.status || 500;
  let message = err.message;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = t(req.locale, 'upload.tooLarge');
        break;
      case 'LIMIT_FILE_COUNT':
        message = t(req.locale, 'upload.tooMany');
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = t(req.locale, 'upload.unexpectedField');
        break;
      default:
        message = t(req.locale, 'upload.error');
    }
  } else if (statusCode === 500) {
    message = t(req.locale, 'middleware.serverError');
  }

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
    message,
    error: message,
    requestId: req.requestId,
  });
};
