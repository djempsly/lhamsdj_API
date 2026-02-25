import { Router } from 'express';
import { toggleWishlist, getMyWishlist, checkWishlist } from '../controllers/wishlistController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getMyWishlist);
router.post('/toggle', authenticate, toggleWishlist);
router.get('/check/:productId', authenticate, checkWishlist);

export default router;
