import { Router } from 'express';
import { createReview, getProductReviews, deleteReview, getReviewsAdmin, moderateReview } from '../controllers/reviewController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Admin routes (BEFORE parameterized ones)
router.get('/admin', authenticate, requireAdmin, getReviewsAdmin);
router.put('/admin/:id/moderate', authenticate, requireAdmin, moderateReview);

// Públicas
router.get('/product/:productId', getProductReviews); // Cualquiera puede leer reseñas

// Privadas
router.post('/', authenticate, createReview); // Solo usuarios logueados pueden opinar
router.delete('/:id', authenticate, deleteReview); // Dueño o Admin borra

export default router;
