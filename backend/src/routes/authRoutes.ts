import { Router } from 'express';
import { register, login, refresh, logout, logoutAll, forgotPassword, resetPassword, getMe, verifyEmail } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/verify/:token', verifyEmail);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);
router.post('/logout-all', authenticate, logoutAll);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.get('/me', authenticate, getMe);

export default router;
