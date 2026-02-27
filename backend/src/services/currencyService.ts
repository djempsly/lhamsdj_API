import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export const CurrencyService = {
  async syncRates() {
    try {
      const res = await fetch(EXCHANGE_API_URL);
      const data = await res.json();
      if (!data.rates) throw new Error('Invalid exchange rate response');

      // Decimal(12,6) permite valor absoluto < 10^6. Ajustamos tasas que vengan fuera de rango.
      const clampRate = (r: number): number => {
        const n = Number(r);
        if (!Number.isFinite(n)) return 1;
        const max = 999999.999999;
        const min = 0.000001;
        const clamped = Math.max(min, Math.min(max, n));
        return Math.round(clamped * 1e6) / 1e6;
      };

      const entries = Object.entries(data.rates) as [string, number][];
      let updated = 0;
      for (const [code, rate] of entries) {
        const safeRate = clampRate(rate);
        await prisma.currency.upsert({
          where: { code },
          update: { rate: safeRate },
          create: { code, name: code, symbol: code, rate: safeRate },
        });
        updated++;
      }
      logger.info({ updated }, 'Currency rates synced');
      return updated;
    } catch (err) {
      logger.error({ err }, 'Failed to sync currency rates');
      throw new Error('Error al sincronizar tasas de cambio');
    }
  },

  async getAll() {
    return await prisma.currency.findMany({ orderBy: { code: 'asc' } });
  },

  async convert(amount: number, from: string, to: string) {
    if (from === to) return { amount, currency: to, rate: 1 };

    const [fromCurrency, toCurrency] = await Promise.all([
      prisma.currency.findUnique({ where: { code: from } }),
      prisma.currency.findUnique({ where: { code: to } }),
    ]);

    if (!fromCurrency || !toCurrency) throw new Error(`Moneda no encontrada: ${!fromCurrency ? from : to}`);

    const amountInUSD = amount / Number(fromCurrency.rate);
    const converted = amountInUSD * Number(toCurrency.rate);
    const rate = Number(toCurrency.rate) / Number(fromCurrency.rate);

    return { amount: Math.round(converted * 100) / 100, currency: to, rate: Math.round(rate * 1000000) / 1000000 };
  },

  async getAllCountries() {
    return await prisma.country.findMany({ orderBy: { name: 'asc' } });
  },

  async detectForCountry(countryCode: string) {
    const country = await prisma.country.findUnique({ where: { code: countryCode } });
    if (!country) return { country: countryCode, currency: 'USD', rate: 1, symbol: '$' };

    const currency = await prisma.currency.findUnique({ where: { code: country.currencyCode } });
    return {
      country: country.code,
      countryName: country.name,
      currency: country.currencyCode,
      rate: currency ? Number(currency.rate) : 1,
      symbol: currency?.symbol || country.currencyCode,
      shippingZone: country.shippingZone,
    };
  },

  async seedCountries() {
    const countries = [
      { code: 'US', name: 'United States', currencyCode: 'USD', shippingZone: 'DOMESTIC' },
      { code: 'DO', name: 'Dominican Republic', currencyCode: 'DOP', shippingZone: 'CARIBBEAN' },
      { code: 'MX', name: 'Mexico', currencyCode: 'MXN', shippingZone: 'LATAM' },
      { code: 'CO', name: 'Colombia', currencyCode: 'COP', shippingZone: 'LATAM' },
      { code: 'BR', name: 'Brazil', currencyCode: 'BRL', shippingZone: 'LATAM' },
      { code: 'ES', name: 'Spain', currencyCode: 'EUR', shippingZone: 'EUROPE' },
      { code: 'GB', name: 'United Kingdom', currencyCode: 'GBP', shippingZone: 'EUROPE' },
      { code: 'DE', name: 'Germany', currencyCode: 'EUR', shippingZone: 'EUROPE' },
      { code: 'FR', name: 'France', currencyCode: 'EUR', shippingZone: 'EUROPE' },
      { code: 'CN', name: 'China', currencyCode: 'CNY', shippingZone: 'ASIA' },
      { code: 'JP', name: 'Japan', currencyCode: 'JPY', shippingZone: 'ASIA' },
      { code: 'CA', name: 'Canada', currencyCode: 'CAD', shippingZone: 'NORTH_AMERICA' },
    ];
    for (const c of countries) {
      await prisma.country.upsert({ where: { code: c.code }, update: c, create: c });
    }
    return countries.length;
  },
};
