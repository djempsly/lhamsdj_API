import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { advancedSearch, autoComplete, getRecommendations, trackView, getRecentlyViewed } from '../controllers/searchController';

const router = Router();
router.get('/', advancedSearch);
router.get('/autocomplete', autoComplete);
router.get('/recommendations/:productId', getRecommendations);
router.post('/track-view/:productId', authenticate, trackView);
router.get('/recently-viewed', authenticate, getRecentlyViewed);

export default router;
