import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { getSecurityDashboard } from '../controllers/securityDashboardController';

const router = Router();
router.get('/dashboard', authenticate, requireAdmin, getSecurityDashboard);
export default router;
