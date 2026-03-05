import { Request, Response, NextFunction } from 'express';

const store = new Map<string, { status: number; body: string; expiresAt: number }>();
const TTL_MS = 24 * 60 * 60 * 1000;

function prune() {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.expiresAt < now) store.delete(k);
  }
}
setInterval(prune, 60 * 1000);

/**
 * Idempotency: same X-Idempotency-Key within TTL returns stored response.
 * Use on payment/create-order routes to avoid duplicate charges.
 */
export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-idempotency-key'] as string;
  if (!key || typeof key !== 'string' || key.length > 128) {
    return next();
  }
  const idemKey = `idem:${req.user?.id ?? req.ip ?? 'anon'}:${key.trim()}`;
  const cached = store.get(idemKey);
  if (cached) {
    res.status(cached.status).setHeader('Content-Type', 'application/json').send(cached.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    const bodyStr = JSON.stringify(body);
    store.set(idemKey, {
      status: res.statusCode,
      body: bodyStr,
      expiresAt: Date.now() + TTL_MS,
    });
    return originalJson(body);
  };
  next();
};
