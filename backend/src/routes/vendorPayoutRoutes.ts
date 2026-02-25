import { Router } from 'express';
import { createConnectAccount, getMyPayouts, processPayouts } from '../controllers/vendorPayoutController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/connect', authenticate, createConnectAccount);
router.get('/mine', authenticate, getMyPayouts);
router.post('/process', authenticate, requireAdmin, processPayouts);

export default router;
