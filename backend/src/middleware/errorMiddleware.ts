import { Request, Response, NextFunction } from 'express';

// Definimos una interfaz simple para errores que tengan status
interface ErrorWithStatus extends Error {
  status?: number;
}

export const errorHandler = (
  err: ErrorWithStatus, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  // Solo mostrar el stack trace en desarrollo
  const stack = process.env.NODE_ENV === 'production' ? null : err.stack;

  console.error(`[Error] ${statusCode} - ${message}`);
  if (stack) console.error(stack);

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: stack, // Opcional enviarlo al front
  });
};