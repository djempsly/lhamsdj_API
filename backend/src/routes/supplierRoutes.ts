import { Router } from 'express';
import {
  createSupplier, getSuppliers, getSupplier, updateSupplier,
  linkProduct, unlinkProduct, importProducts,
  fulfillOrder, getSupplierOrders, testConnection, getAdapterTypes,
} from '../controllers/supplierController';
import { supplierWebhook } from '../controllers/webhookController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public webhook endpoint (authenticated via signature)
router.post('/webhook/:supplierId', supplierWebhook);

// Admin routes
router.get('/adapter-types', authenticate, requireAdmin, getAdapterTypes);
router.get('/', authenticate, requireAdmin, getSuppliers);
router.post('/', authenticate, requireAdmin, createSupplier);
router.get('/:id', authenticate, requireAdmin, getSupplier);
router.patch('/:id', authenticate, requireAdmin, updateSupplier);
router.post('/:id/test', authenticate, requireAdmin, testConnection);

router.post('/:id/link-product', authenticate, requireAdmin, linkProduct);
router.delete('/:id/unlink-product/:productId', authenticate, requireAdmin, unlinkProduct);
router.post('/:id/import', authenticate, requireAdmin, importProducts);
router.get('/:id/orders', authenticate, requireAdmin, getSupplierOrders);

router.post('/fulfill/:orderId', authenticate, requireAdmin, fulfillOrder);

export default router;
