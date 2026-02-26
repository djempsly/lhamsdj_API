import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, payOrder, adminGetAllOrders, adminUpdateOrderStatus, adminExportOrders } from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/admin/all', authenticate, requireAdmin, adminGetAllOrders);
router.get('/admin/export', authenticate, requireAdmin, adminExportOrders);
router.patch('/admin/:id/status', authenticate, requireAdmin, adminUpdateOrderStatus);
router.get('/:id', authenticate, getOrderById);



// Nueva ruta para simular pago
//router.patch('/:id/pay', authenticate, payOrder); 

export default router;