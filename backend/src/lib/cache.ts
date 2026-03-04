/**
 * Cache en memoria con TTL (time-to-live).
 * Uso: categorías, monedas, países (datos que cambian poco).
 * Invalidar manualmente al crear/actualizar/borrar (ej. CategoryService.create → cache.del('categories')).
 */

const store = new Map<string, { value: unknown; expiresAt: number }>();

const defaultTtlMs = 5 * 60 * 1000; // 5 min

export function get<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function set<T>(key: string, value: T, ttlMs: number = defaultTtlMs): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function del(key: string): void {
  store.delete(key);
}

export function delPattern(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export const CACHE_KEYS = {
  CATEGORIES_ALL: 'categories:all',
  CURRENCIES_ALL: 'currencies:all',
  COUNTRIES: 'countries',
} as const;
