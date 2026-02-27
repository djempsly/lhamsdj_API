import { Request, Response } from 'express';
import { t } from '../i18n/t';
import { CurrencyService } from '../services/currencyService';
import { z } from 'zod';

const convertSchema = z.object({
  amount: z.number().positive(),
  from: z.string().length(3),
  to: z.string().length(3),
});

export const getCurrencies = async (_req: Request, res: Response) => {
  try {
    const currencies = await CurrencyService.getAll();
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
    res.json({ success: true, message: t(req.locale, 'currency.ratesUpdated', { count }) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCountries = async (_req: Request, res: Response) => {
  try {
    const countries = await CurrencyService.getAllCountries();
    res.json({ success: true, data: countries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const seedCountries = async (req: Request, res: Response) => {
  try {
    const count = await CurrencyService.seedCountries();
    res.json({ success: true, message: t(req.locale, 'currency.countriesUpdated', { count }) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
