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

/**
 * Fields that contain user free-text (descriptions, messages, etc.) are exempt
 * from SQL-injection pattern matching because they generate false positives.
 * These fields are already safe via Prisma parameterized queries.
 */
const SQL_CHECK_EXEMPT_FIELDS = new Set([
  'description', 'body', 'message', 'comment', 'content',
  'question', 'answer', 'notes', 'details', 'resolution',
  'subject', 'bio', 'about',
]);

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
  return SQL_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0; // reset regex state for /g patterns
    return pattern.test(value);
  });
}

function deepCheckSql(obj: unknown, parentKey?: string): boolean {
  if (typeof obj === 'string') {
    // Skip free-text fields that would trigger false positives
    if (parentKey && SQL_CHECK_EXEMPT_FIELDS.has(parentKey)) return false;
    return detectSqlInjection(obj);
  }
  if (Array.isArray(obj)) return obj.some((item) => deepCheckSql(item, parentKey));
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).some(
      ([key, value]) => deepCheckSql(value, key),
    );
  }
  return false;
}

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (deepCheckSql(req.body) || deepCheckSql(req.query) || deepCheckSql(req.params)) {
    return res.status(400).json({ success: false, message: 'Entrada no permitida.' });
  }

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body as Record<string, unknown>) as Request['body'];
  }
  // req.query y req.params en Express son de solo lectura (getters); no se pueden reasignar.
  // Solo se valida con deepCheckSql arriba y se rechaza si hay patrones peligrosos.

  next();
};
