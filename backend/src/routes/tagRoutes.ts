import { Router } from 'express';
import { searchTags, createTag } from '../controllers/tagController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, requireAdmin, searchTags);
router.post('/', authenticate, requireAdmin, createTag);

export default router;
