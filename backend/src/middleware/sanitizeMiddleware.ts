import { Request, Response, NextFunction } from 'express';

const DANGEROUS_PATTERNS = [
  /<script\b[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
];

const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b.*\b(FROM|INTO|TABLE|WHERE|SET)\b)/gi,
  /(--|;)\s*(DROP|DELETE|UPDATE|INSERT)/gi,
  /'\s*(OR|AND)\s*'?\s*\d*\s*=\s*\d*/gi,
];

function sanitizeString(value: string): string {
  let clean = value;

  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }

  clean = clean.replace(/\0/g, '');

  return clean;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') return sanitizeObject(value as Record<string, unknown>);
  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = sanitizeString(key);
    sanitized[cleanKey] = sanitizeValue(value);
  }
  return sanitized;
}

function detectSqlInjection(value: string): boolean {
  return SQL_PATTERNS.some((pattern) => pattern.test(value));
}

function deepCheckSql(obj: unknown): boolean {
  if (typeof obj === 'string') return detectSqlInjection(obj);
  if (Array.isArray(obj)) return obj.some(deepCheckSql);
  if (obj !== null && typeof obj === 'object') {
    return Object.values(obj as Record<string, unknown>).some(deepCheckSql);
  }
  return false;
}

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (deepCheckSql(req.body) || deepCheckSql(req.query) || deepCheckSql(req.params)) {
    return res.status(400).json({ success: false, message: 'Entrada no permitida.' });
  }

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as any;
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as any;
  }

  next();
};
