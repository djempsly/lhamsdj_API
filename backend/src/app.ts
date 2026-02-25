import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import logger from './lib/logger';

const app: Application = express();

// 1. Security headers (Helmet + custom)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(securityHeaders);
app.use(nocache());

// 2. Cookie parser (antes de todo lo que necesite leer cookies)
app.use(cookieParser());

// 3. CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origen '${origin}' no permitido.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 4. Rate limiting global (endpoints específicos tienen sus propios limits)
app.use(apiPublicLimiter);

// 5. Stripe webhook ANTES del JSON parser (necesita raw body)
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentRoutes);

// 6. JSON parser + sanitización
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(sanitizeInput);

// 7. Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip }, 'request');
  next();
});

// 8. Swagger docs (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 9. Rutas API
app.use('/api/v1', routes);
app.use('/api/v1/payments', paymentRoutes);

// 10. Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'LhamsDJ API' });
});

// 11. Error handler global (siempre al final)
app.use(errorHandler);

export default app;
