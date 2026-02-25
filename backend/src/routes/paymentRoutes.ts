import { Router } from 'express';
import { initiatePayment, stripeWebhook } from '../controllers/paymentController';
import { createMercadoPagoPayment, mercadoPagoWebhook, getAvailablePaymentMethods } from '../controllers/multiPaymentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Payment methods discovery
router.get('/methods', getAvailablePaymentMethods);

// Stripe
router.post('/create-intent', authenticate, initiatePayment);
router.post('/webhook', stripeWebhook);

// MercadoPago
router.post('/mercadopago/create', authenticate, createMercadoPagoPayment);
router.post('/mercadopago/webhook', mercadoPagoWebhook);

export default router;
