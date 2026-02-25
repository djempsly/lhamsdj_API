import { CurrencyService } from '../services/currencyService';
import logger from '../lib/logger';

const SYNC_INTERVAL = 60 * 60 * 1000; // cada hora

async function syncRates() {
  try {
    const count = await CurrencyService.syncRates();
    logger.info({ currencies: count }, 'Currency rates auto-synced');
  } catch (err) {
    logger.error({ err }, 'Failed to auto-sync currency rates');
  }
}

export function startCurrencySyncJob() {
  syncRates();
  setInterval(syncRates, SYNC_INTERVAL);
  logger.info('Currency sync job started (runs every hour)');
}
