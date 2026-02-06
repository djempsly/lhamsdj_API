import { Router } from 'express';
import { deleteProductImage } from '../controllers/productImageController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// DELETE /api/v1/product-images/15
router.delete('/:id', authenticate, requireAdmin, deleteProductImage);

export default router;


