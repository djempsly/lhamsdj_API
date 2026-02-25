import { Request, Response } from 'express';
import { MercadoPagoService } from '../services/mercadopagoService';
import { z } from 'zod';

const mpSchema = z.object({ orderId: z.number().int().positive() });

export const createMercadoPagoPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = mpSchema.parse(req.body);
    const result = await MercadoPagoService.createPreference(req.user?.id!, orderId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    await MercadoPagoService.handleWebhook(req.body);
    res.json({ received: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAvailablePaymentMethods = async (req: Request, res: Response) => {
  const country = req.geo?.country || 'US';

  const methods: { id: string; name: string; icon: string; available: boolean }[] = [
    { id: 'stripe', name: 'Credit/Debit Card', icon: 'credit-card', available: true },
    { id: 'paypal', name: 'PayPal', icon: 'paypal', available: true },
  ];

  const latamCountries = ['MX', 'CO', 'BR', 'AR', 'CL', 'PE', 'UY'];
  if (latamCountries.includes(country) && MercadoPagoService.isConfigured()) {
    methods.push({ id: 'mercadopago', name: 'MercadoPago', icon: 'mercadopago', available: true });
  }

  res.json({ success: true, data: { methods, country, currency: req.geo?.currency } });
};
