import { Request, Response } from 'express';
import { ShippingService } from '../services/shippingService';
import { z } from 'zod';

const estimateSchema = z.object({ addressId: z.number().int().positive() });
const countryEstimateSchema = z.object({ countryCode: z.string().length(2), weightKg: z.number().positive() });

export const estimateShippingRates = async (req: Request, res: Response) => {
  try {
    const { addressId } = estimateSchema.parse(req.body);
    const rates = await ShippingService.estimateRates(addressId, req.user?.id!);
    res.json({ success: true, data: rates });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const estimateByCountry = async (req: Request, res: Response) => {
  try {
    const { countryCode, weightKg } = countryEstimateSchema.parse(req.body);
    const rates = await ShippingService.estimateForCountry(countryCode, weightKg);
    res.json({ success: true, data: rates });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const trackShipment = async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;
    const { default: shippingManager } = await import('../shipping/shippingManager');
    const info = await shippingManager.getTracking(String(trackingNumber));
    if (!info) return res.status(404).json({ success: false, message: 'No se encontró información de tracking' });
    res.json({ success: true, data: info });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
