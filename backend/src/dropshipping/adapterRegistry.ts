import { SupplierAdapter } from './types';
import { manualAdapter } from './manualAdapter';
import { createGenericApiAdapter } from './genericApiAdapter';
import logger from '../lib/logger';

const adapters = new Map<string, SupplierAdapter>();

adapters.set('MANUAL', manualAdapter);

export function registerAdapter(name: string, adapter: SupplierAdapter) {
  adapters.set(name.toUpperCase(), adapter);
  logger.info({ adapter: name }, 'Supplier adapter registered');
}

export function getAdapter(apiType: string): SupplierAdapter {
  return adapters.get(apiType.toUpperCase()) || manualAdapter;
}

/**
 * Register a supplier adapter from DB config.
 * Called at startup for each supplier with apiType != MANUAL.
 */
export function registerFromConfig(apiType: string, baseUrl: string, apiKey: string) {
  if (apiType === 'MANUAL' || !baseUrl || !apiKey) return;
  const adapter = createGenericApiAdapter({ name: apiType, baseUrl, apiKey });
  registerAdapter(apiType, adapter);
}

export function listAdapters(): string[] {
  return Array.from(adapters.keys());
}
