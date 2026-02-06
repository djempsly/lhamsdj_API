import { Router } from 'express';
import { createReview, getProductReviews, deleteReview } from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Públicas
router.get('/product/:productId', getProductReviews); // Cualquiera puede leer reseñas

// Privadas
router.post('/', authenticate, createReview); // Solo usuarios logueados pueden opinar
router.delete('/:id', authenticate, deleteReview); // Dueño o Admin borra

export default router;