import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { searchLimiter } from '../middleware/rateLimiters';
import { advancedSearch, getFilters, autoComplete, getRecommendations, trackView, getRecentlyViewed } from '../controllers/searchController';

const router = Router();
router.get('/', searchLimiter, advancedSearch);
router.get('/filters', searchLimiter, getFilters);
router.get('/autocomplete', searchLimiter, autoComplete);
router.get('/recommendations/:productId', getRecommendations);
router.post('/track-view/:productId', authenticate, trackView);
router.get('/recently-viewed', authenticate, getRecentlyViewed);

export default router;
