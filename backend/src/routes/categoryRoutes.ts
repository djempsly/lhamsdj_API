import { Router } from 'express';
import { 
  createCategory, 
  getCategories, 
  getCategoryBySlug, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Rutas Públicas
router.get('/', getCategories);       // Listar árbol de categorías
router.get('/:slug', getCategoryBySlug); // Ver detalle por URL amigable

// Rutas Admin
router.post('/', authenticate, requireAdmin, createCategory);
router.patch('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;