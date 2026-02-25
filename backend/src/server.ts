import dotenv from 'dotenv';
dotenv.config();

import { validateEnvironment } from './lib/validateEnv';
validateEnvironment();

import app from './app';
import logger from './lib/logger';
import { startTokenCleanupJob } from './jobs/cleanupTokens';
import { startCurrencySyncJob } from './jobs/syncCurrencyRates';
import { startDropshipSyncJob } from './jobs/syncDropshipInventory';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  startTokenCleanupJob();
  startCurrencySyncJob();
  startDropshipSyncJob();
});
