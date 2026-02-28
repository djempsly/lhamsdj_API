import { SupplierAdapter } from './types';
import { manualAdapter } from './manualAdapter';
import { createGenericApiAdapter } from './genericApiAdapter';
import { createCJDropshippingAdapter } from './cjDropshippingAdapter';
import { createPrintfulAdapter } from './printfulAdapter';
import { createHyperSKUAdapter } from './hyperskuAdapter';
import { createSpocketAdapter } from './spocketAdapter';
import { createCustomApiAdapter, CustomApiConfig } from './customApiAdapter';
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

const KNOWN_ADAPTERS: Record<string, (config: { apiKey: string; baseUrl?: string }) => SupplierAdapter> = {
  CJ_DROPSHIPPING: (c) => createCJDropshippingAdapter({ apiKey: c.apiKey }),
  PRINTFUL: (c) => createPrintfulAdapter({ apiKey: c.apiKey }),
  HYPERSKU: (c) => createHyperSKUAdapter({ apiKey: c.apiKey }),
  SPOCKET: (c) => createSpocketAdapter({ apiKey: c.apiKey }),
};

export function registerFromConfig(apiType: string, baseUrl: string, apiKey: string, apiConfig?: any) {
  if (apiType === 'MANUAL' || !apiKey) return;

  const key = apiType.toUpperCase();
  const factory = KNOWN_ADAPTERS[key];

  if (factory) {
    registerAdapter(key, factory({ apiKey, baseUrl }));
  } else if (key === 'CUSTOM_API' && baseUrl && apiConfig) {
    registerAdapter(`CUSTOM_${Date.now()}`, createCustomApiAdapter(
      apiConfig.adapterName || 'Custom',
      baseUrl,
      apiKey,
      apiConfig as CustomApiConfig,
    ));
  } else if (baseUrl) {
    registerAdapter(key, createGenericApiAdapter({ name: apiType, baseUrl, apiKey }));
  }
}

export function registerCustomAdapter(supplierId: number, name: string, baseUrl: string, apiKey: string, apiConfig: CustomApiConfig) {
  const adapterKey = `CUSTOM_${supplierId}`;
  registerAdapter(adapterKey, createCustomApiAdapter(name, baseUrl, apiKey, apiConfig));
  return adapterKey;
}

export function listAdapters(): string[] {
  return Array.from(adapters.keys());
}

export const SUPPORTED_ADAPTER_TYPES = [
  { value: 'MANUAL', label: 'Manual (no API)', requiresUrl: false, requiresConfig: false },
  { value: 'CJ_DROPSHIPPING', label: 'CJ Dropshipping', requiresUrl: false, requiresConfig: false },
  { value: 'PRINTFUL', label: 'Printful', requiresUrl: false, requiresConfig: false },
  { value: 'HYPERSKU', label: 'HyperSKU', requiresUrl: false, requiresConfig: false },
  { value: 'SPOCKET', label: 'Spocket', requiresUrl: false, requiresConfig: false },
  { value: 'GENERIC_API', label: 'Generic REST API (standard endpoints)', requiresUrl: true, requiresConfig: false },
  { value: 'CUSTOM_API', label: 'Custom API (configure endpoints & mapping)', requiresUrl: true, requiresConfig: true },
] as const;
