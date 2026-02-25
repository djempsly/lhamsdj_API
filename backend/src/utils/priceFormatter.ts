import { prisma } from '../lib/prisma';

const CURRENCY_FORMATS: Record<string, { locale: string; symbol: string; decimals: number }> = {
  USD: { locale: 'en-US', symbol: '$', decimals: 2 },
  EUR: { locale: 'de-DE', symbol: '€', decimals: 2 },
  GBP: { locale: 'en-GB', symbol: '£', decimals: 2 },
  MXN: { locale: 'es-MX', symbol: 'MX$', decimals: 2 },
  DOP: { locale: 'es-DO', symbol: 'RD$', decimals: 2 },
  COP: { locale: 'es-CO', symbol: 'COP$', decimals: 0 },
  BRL: { locale: 'pt-BR', symbol: 'R$', decimals: 2 },
  ARS: { locale: 'es-AR', symbol: 'AR$', decimals: 0 },
  CLP: { locale: 'es-CL', symbol: 'CLP$', decimals: 0 },
  PEN: { locale: 'es-PE', symbol: 'S/', decimals: 2 },
  CAD: { locale: 'en-CA', symbol: 'CA$', decimals: 2 },
  CNY: { locale: 'zh-CN', symbol: '¥', decimals: 2 },
  JPY: { locale: 'ja-JP', symbol: '¥', decimals: 0 },
  KRW: { locale: 'ko-KR', symbol: '₩', decimals: 0 },
  INR: { locale: 'en-IN', symbol: '₹', decimals: 2 },
  AUD: { locale: 'en-AU', symbol: 'A$', decimals: 2 },
  NZD: { locale: 'en-NZ', symbol: 'NZ$', decimals: 2 },
};

const rateCache = new Map<string, { rate: number; expiresAt: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 min

async function getRate(currencyCode: string): Promise<number> {
  if (currencyCode === 'USD') return 1;

  const cached = rateCache.get(currencyCode);
  if (cached && cached.expiresAt > Date.now()) return cached.rate;

  const currency = await prisma.currency.findUnique({ where: { code: currencyCode } });
  const rate = currency ? Number(currency.rate) : 1;
  rateCache.set(currencyCode, { rate, expiresAt: Date.now() + CACHE_TTL });
  return rate;
}

export async function convertPrice(amountUSD: number, toCurrency: string): Promise<number> {
  const rate = await getRate(toCurrency);
  const converted = amountUSD * rate;
  const fmt = CURRENCY_FORMATS[toCurrency];
  const decimals = fmt?.decimals ?? 2;
  return Number(converted.toFixed(decimals));
}

export function formatPrice(amount: number, currencyCode: string): string {
  const fmt = CURRENCY_FORMATS[currencyCode];
  if (!fmt) return `${currencyCode} ${amount.toFixed(2)}`;
  return `${fmt.symbol}${amount.toFixed(fmt.decimals)}`;
}

/**
 * Converts an array of products' prices to the target currency.
 * Used by product listing endpoints.
 */
export async function convertProductPrices(products: any[], toCurrency: string) {
  if (toCurrency === 'USD') return products;

  const rate = await getRate(toCurrency);
  const fmt = CURRENCY_FORMATS[toCurrency];
  const decimals = fmt?.decimals ?? 2;

  return products.map((p: any) => ({
    ...p,
    localPrice: Number((Number(p.price) * rate).toFixed(decimals)),
    localCurrency: toCurrency,
  }));
}
