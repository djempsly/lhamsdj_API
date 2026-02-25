import { Router } from 'express';
import { estimateShippingRates, estimateByCountry, trackShipment } from '../controllers/shippingController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/estimate', authenticate, estimateShippingRates);
router.post('/estimate-country', estimateByCountry);
router.get('/track/:trackingNumber', authenticate, trackShipment);

export default router;
