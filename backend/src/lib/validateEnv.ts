import logger from './logger';

const REQUIRED_IN_PRODUCTION = [
  'JWT_SECRET',
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_BUCKET_NAME',
  'AWS_REGION',
  'RESEND_API_KEY',
];

const REQUIRED_ALWAYS = ['DATABASE_URL'];

export function validateEnvironment() {
  const missing: string[] = [];
  const isProd = process.env.NODE_ENV === 'production';
  const requiredVars = isProd ? REQUIRED_IN_PRODUCTION : REQUIRED_ALWAYS;

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    logger.fatal(msg);
    if (isProd) {
      throw new Error(msg);
    } else {
      logger.warn(`[DEV] ${msg} — some features may not work`);
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET should be at least 32 characters for production security');
  }

  logger.info('Environment validation passed');
}
