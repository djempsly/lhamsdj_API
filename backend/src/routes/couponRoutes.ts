import { Router } from 'express';
import { createCoupon, validateCoupon, getCoupons, toggleCoupon, deleteCoupon } from '../controllers/couponController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/validate', authenticate, validateCoupon);
router.get('/', authenticate, requireAdmin, getCoupons);
router.post('/', authenticate, requireAdmin, createCoupon);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleCoupon);
router.delete('/:id', authenticate, requireAdmin, deleteCoupon);

export default router;
