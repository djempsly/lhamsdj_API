import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  bulkAction,
  getLowStock,
  getProductAnalytics,
  getPriceHistory,
  reorderImages,
  exportProducts,
} from '../controllers/productController';
import { setProductTags } from '../controllers/tagController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Admin routes (MUST be before /:slug to avoid slug conflicts)
router.get('/low-stock', authenticate, requireAdmin, getLowStock);
router.get('/export', authenticate, requireAdmin, exportProducts);
router.post('/bulk', authenticate, requireAdmin, bulkAction);

// Product by ID (for admin edit page)
router.get('/id/:id', getProductById);

// Public routes
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Admin CRUD
router.post('/', authenticate, requireAdmin, createProduct);
router.patch('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

// Admin product-specific actions
router.post('/:id/duplicate', authenticate, requireAdmin, duplicateProduct);
router.get('/:id/analytics', authenticate, requireAdmin, getProductAnalytics);
router.get('/:id/price-history', authenticate, requireAdmin, getPriceHistory);
router.put('/:id/images/reorder', authenticate, requireAdmin, reorderImages);
router.put('/:id/tags', authenticate, requireAdmin, setProductTags);

export default router;
