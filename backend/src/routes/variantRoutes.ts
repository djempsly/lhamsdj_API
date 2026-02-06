// import { Router } from 'express';
// import { createVariant, deleteVariant } from '../controllers/variantController';
// import { authenticate, requireAdmin } from '../middleware/authMiddleware';

// const router = Router();

// // Solo Admin
// router.post('/', authenticate, requireAdmin, createVariant);
// router.delete('/:id', authenticate, requireAdmin, deleteVariant);

// export default router;


import { Router } from 'express';
import { createVariant, updateVariant, deleteVariant } from '../controllers/variantController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// SOLO ADMIN puede gestionar variantes
router.post('/', authenticate, requireAdmin, createVariant);
router.patch('/:id', authenticate, requireAdmin, updateVariant);
router.delete('/:id', authenticate, requireAdmin, deleteVariant);

export default router;