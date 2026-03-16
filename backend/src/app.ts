import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import nocache from 'nocache';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

import routes from './routes/index';
import paymentRoutes from './routes/paymentRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { sanitizeInput } from './middleware/sanitizeMiddleware';
import { securityHeaders } from './middleware/securityHeaders';
import { apiPublicLimiter } from './middleware/rateLimiters';
import { requestId } from './middleware/requestId';
import { geolocate } from './middleware/geolocate';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import logger from './lib/logger';
import { localeMiddleware } from './middleware/localeMiddleware';
import { register as metricsRegister } from './lib/metrics';
import { prisma } from './lib/prisma';

const app: Application = express();

app.use(requestId);

// Security headers (Helmet + custom)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(securityHeaders);
app.use(nocache());

app.use(cookieParser());
app.use(localeMiddleware);

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Csrf-Token'],
}));

// Rate limiting (specific endpoints have their own limits)
app.use(apiPublicLimiter);

// Compress responses (gzip)
app.use(compression());

// Stripe webhook (before JSON parser, needs raw body)
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentRoutes);

// JSON parser + sanitization
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(sanitizeInput);

// Geolocation (detect country/currency from IP)
app.use(geolocate);

// Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip, requestId: req.requestId, country: req.geo?.country }, 'request');
  next();
});

// Metrics (for Prometheus)
app.use(metricsMiddleware);

// Swagger docs (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// API routes
app.use('/api/v1', routes);
app.use('/api/v1/payments', paymentRoutes);

// Health check (simple)
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'LhamsDJ API' });
});

// Health check with DB — restricted to internal/trusted IPs
app.get('/health', (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || '';
  const trusted = /^(127\.|::1|::ffff:127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(ip);
  if (trusted) return next();
  // In production, only trusted IPs; in dev, allow all
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
}, async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
});

// Prometheus metrics — protected: only internal/trusted IPs or Bearer token
app.get('/metrics', (req, res, next) => {
  const metricsToken = process.env.METRICS_TOKEN;
  const authHeader = req.headers.authorization;

  // Allow if a METRICS_TOKEN is configured and matches Bearer header
  if (metricsToken && authHeader === `Bearer ${metricsToken}`) return next();

  // Allow trusted internal IPs (loopback, Docker bridge, private ranges)
  const ip = req.ip || req.socket?.remoteAddress || '';
  const trusted = /^(127\.|::1|::ffff:127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(ip);
  if (trusted) return next();

  res.status(403).json({ success: false, message: 'Forbidden' });
}, async (_req, res) => {
  res.setHeader('Content-Type', metricsRegister.contentType);
  res.send(await metricsRegister.metrics());
});

// Global error handler (always last)
app.use(errorHandler);

export default app;
