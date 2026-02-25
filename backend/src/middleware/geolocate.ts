import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

declare global {
  namespace Express {
    interface Request {
      geo?: { country: string; currency: string; timezone?: string | undefined };
    }
  }
}

const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', MX: 'MXN', DO: 'DOP', PR: 'USD', CO: 'COP', BR: 'BRL',
  AR: 'ARS', CL: 'CLP', PE: 'PEN', GB: 'GBP', DE: 'EUR', FR: 'EUR', ES: 'EUR',
  IT: 'EUR', NL: 'EUR', PT: 'EUR', CN: 'CNY', JP: 'JPY', KR: 'KRW', IN: 'INR',
  AU: 'AUD', NZ: 'NZD', NG: 'NGN', ZA: 'ZAR',
};

const GEO_API = 'http://ip-api.com/json';
const geoCache = new Map<string, { country: string; currency: string; expiresAt: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function lookupIp(ip: string): Promise<{ country: string; currency: string }> {
  const cached = geoCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) {
    return { country: cached.country, currency: cached.currency };
  }

  try {
    const cleanIp = ip === '::1' || ip === '127.0.0.1' ? '' : ip;
    const url = cleanIp ? `${GEO_API}/${cleanIp}?fields=countryCode,timezone` : `${GEO_API}/?fields=countryCode,timezone`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'success' && data.countryCode) {
      const country = data.countryCode;
      const currency = COUNTRY_CURRENCY[country] || 'USD';
      geoCache.set(ip, { country, currency, expiresAt: Date.now() + CACHE_TTL });
      return { country, currency };
    }
  } catch (err) {
    logger.debug({ ip, err }, 'Geolocation lookup failed, defaulting to US/USD');
  }

  return { country: 'US', currency: 'USD' };
}

/**
 * Detects user country from IP or Accept-Language header.
 * Sets req.geo with country code and local currency.
 */
export const geolocate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() || '' : req.ip || '';

    const overrideCountry = req.headers['x-country'] as string | undefined;
    const overrideCurrency = req.headers['x-currency'] as string | undefined;

    if (overrideCountry && overrideCurrency) {
      req.geo = { country: overrideCountry.toUpperCase(), currency: overrideCurrency.toUpperCase() };
    } else {
      const { country, currency } = await lookupIp(ip);
      req.geo = { country, currency: overrideCurrency?.toUpperCase() || currency };
    }
  } catch {
    req.geo = { country: 'US', currency: 'USD' };
  }

  next();
};
