import pino from 'pino';

const IS_PROD = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (IS_PROD ? 'info' : 'debug'),
  ...(IS_PROD
    ? { formatters: { level: (label: string) => ({ level: label }) } }
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'newPassword', 'resetToken'],
    censor: '[REDACTED]',
  },
});

export default logger;
