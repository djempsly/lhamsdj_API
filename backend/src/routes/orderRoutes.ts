import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, adminGetAllOrders, adminUpdateOrderStatus, adminExportOrders } from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { checkoutLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/', authenticate, checkoutLimiter, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/admin/all', authenticate, requireAdmin, adminGetAllOrders);
router.get('/admin/export', authenticate, requireAdmin, adminExportOrders);
router.patch('/admin/:id/status', authenticate, requireAdmin, adminUpdateOrderStatus);
router.get('/:id', authenticate, getOrderById);

export default router;
