import { Router } from 'express';
import { initiatePayment, stripeWebhook } from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/create-intent', authenticate, initiatePayment);
router.post('/webhook', stripeWebhook);

export default router;