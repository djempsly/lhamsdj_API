import { NewsletterService } from '../services/newsletterService';
import logger from '../lib/logger';

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Sends "ofertas del día" email to all newsletter subscribers. Runs every 24h (first run after 24h from startup). */
export function startDealOfTheDayJob() {
  async function run() {
    try {
      const { sent, failed } = await NewsletterService.sendDealToSubscribers();
      logger.info({ sent, failed }, 'Deal of the day emails sent');
    } catch (err) {
      logger.error({ err }, 'Deal of the day email job failed');
    }
  }
  setInterval(run, INTERVAL_MS);
  logger.info('Deal of the day email job started (runs every 24h)');
}
