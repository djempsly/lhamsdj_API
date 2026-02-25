import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

export async function cleanupExpiredTokens() {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    });
    if (result.count > 0) {
      logger.info({ deleted: result.count }, 'Expired/revoked refresh tokens cleaned up');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to cleanup refresh tokens');
  }
}

const CLEANUP_INTERVAL = 60 * 60 * 1000; // cada hora

export function startTokenCleanupJob() {
  cleanupExpiredTokens();
  setInterval(cleanupExpiredTokens, CLEANUP_INTERVAL);
  logger.info('Token cleanup job started (runs every hour)');
}
