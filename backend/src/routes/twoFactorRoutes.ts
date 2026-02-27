import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { setup2FA, enable2FA, verify2FA, disable2FA, getActiveSessions, revokeSession } from '../controllers/twoFactorController';

const router = Router();
router.post('/setup', authenticate, setup2FA);
router.post('/enable', authenticate, enable2FA);
router.post('/verify', verify2FA);
router.post('/disable', authenticate, disable2FA);
router.get('/sessions', authenticate, getActiveSessions);
router.delete('/sessions/:id', authenticate, revokeSession);

export default router;
