import { Request, Response } from 'express';
import { t } from '../i18n/t';
import { CurrencyService } from '../services/currencyService';
import * as cache from '../lib/cache';
import { z } from 'zod';

const convertSchema = z.object({
  amount: z.number().positive(),
  from: z.string().length(3),
  to: z.string().length(3),
});

const CURRENCIES_TTL = 10 * 60 * 1000; // 10 min
const COUNTRIES_TTL = 15 * 60 * 1000;   // 15 min

export const getCurrencies = async (_req: Request, res: Response) => {
  try {
    const cached = cache.get(cache.CACHE_KEYS.CURRENCIES_ALL);
    if (cached) return res.json({ success: true, data: cached });
    const currencies = await CurrencyService.getAll();
    cache.set(cache.CACHE_KEYS.CURRENCIES_ALL, currencies, CURRENCIES_TTL);
    res.json({ success: true, data: currencies });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const convertCurrency = async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = convertSchema.parse(req.body);
    const result = await CurrencyService.convert(amount, from, to);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const syncRates = async (req: Request, res: Response) => {
  try {
    const count = await CurrencyService.syncRates();
    cache.del(cache.CACHE_KEYS.CURRENCIES_ALL);
    res.json({ success: true, message: t(req.locale, 'currency.ratesUpdated', { count }) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCountries = async (_req: Request, res: Response) => {
  try {
    const cached = cache.get(cache.CACHE_KEYS.COUNTRIES);
    if (cached) return res.json({ success: true, data: cached });
    const countries = await CurrencyService.getAllCountries();
    cache.set(cache.CACHE_KEYS.COUNTRIES, countries, COUNTRIES_TTL);
    res.json({ success: true, data: countries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const seedCountries = async (req: Request, res: Response) => {
  try {
    const count = await CurrencyService.seedCountries();
    cache.del(cache.CACHE_KEYS.COUNTRIES);
    res.json({ success: true, message: t(req.locale, 'currency.countriesUpdated', { count }) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const detectCurrency = async (req: Request, res: Response) => {
  try {
    const countryCode = (req.query.country as string || '').toUpperCase();
    if (!countryCode || countryCode.length !== 2) {
      return res.status(400).json({ success: false, message: 'Country code required (ISO 2-letter)' });
    }
    const result = await CurrencyService.detectForCountry(countryCode);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
