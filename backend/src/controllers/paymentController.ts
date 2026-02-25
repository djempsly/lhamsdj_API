import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { createPaymentIntentSchema } from '../validation/paymentSchema';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { orderId } = createPaymentIntentSchema.parse(req.body);
    const result = await PaymentService.createPaymentIntent(userId, orderId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    return res.status(400).json({ success: false, message: 'Missing stripe-signature header' });
  }
  try {
    await PaymentService.handleWebhook(signature, req.body);
    res.json({ received: true });
  } catch (error: any) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
