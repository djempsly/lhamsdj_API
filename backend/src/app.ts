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

// Health check with DB (for alerting: 503 = degraded)
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
});

// Prometheus metrics (no aggressive rate limit so scraper is not blocked)
app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', metricsRegister.contentType);
  res.send(await metricsRegister.metrics());
});

// Global error handler (always last)
app.use(errorHandler);

export default app;
