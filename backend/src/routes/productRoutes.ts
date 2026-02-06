import { Router } from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductBySlug, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Rutas Públicas
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Rutas Admin
router.post('/', authenticate, requireAdmin, createProduct);
router.patch('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;