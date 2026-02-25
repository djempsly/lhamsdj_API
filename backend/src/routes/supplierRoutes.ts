import { Router } from 'express';
import {
  createSupplier, getSuppliers, getSupplier, updateSupplier,
  linkProduct, unlinkProduct, importProducts,
  fulfillOrder, getSupplierOrders,
} from '../controllers/supplierController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, requireAdmin, getSuppliers);
router.post('/', authenticate, requireAdmin, createSupplier);
router.get('/:id', authenticate, requireAdmin, getSupplier);
router.patch('/:id', authenticate, requireAdmin, updateSupplier);

router.post('/:id/link-product', authenticate, requireAdmin, linkProduct);
router.delete('/:id/unlink-product/:productId', authenticate, requireAdmin, unlinkProduct);
router.post('/:id/import', authenticate, requireAdmin, importProducts);
router.get('/:id/orders', authenticate, requireAdmin, getSupplierOrders);

router.post('/fulfill/:orderId', authenticate, requireAdmin, fulfillOrder);

export default router;
