import { Router } from 'express';
import { getOrderShipments, updateTracking, updateShipmentStatus, getVendorShipments } from '../controllers/shipmentController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/order/:orderId', authenticate, getOrderShipments);
router.get('/vendor/mine', authenticate, getVendorShipments);
router.patch('/:id/tracking', authenticate, updateTracking);
router.patch('/:id/status', authenticate, requireAdmin, updateShipmentStatus);

export default router;
