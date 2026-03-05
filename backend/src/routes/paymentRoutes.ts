import { Router } from 'express';
import { initiatePayment, stripeWebhook } from '../controllers/paymentController';
import { createMercadoPagoPayment, mercadoPagoWebhook, getAvailablePaymentMethods } from '../controllers/multiPaymentController';
import { authenticate } from '../middleware/authMiddleware';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware';

const router = Router();

// Payment methods discovery
router.get('/methods', getAvailablePaymentMethods);

// Stripe (idempotency evita cobros duplicados)
router.post('/create-intent', authenticate, idempotencyMiddleware, initiatePayment);
router.post('/webhook', stripeWebhook);

// MercadoPago
router.post('/mercadopago/create', authenticate, idempotencyMiddleware, createMercadoPagoPayment);
router.post('/mercadopago/webhook', mercadoPagoWebhook);

export default router;
