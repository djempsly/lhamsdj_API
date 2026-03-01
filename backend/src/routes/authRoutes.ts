import { Router } from 'express';
import { register, login, loginVerify2FA, refresh, logout, logoutAll, forgotPassword, resetPassword, getMe, verifyEmail, verifyByCode } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { authLimiter, refreshLimiter, passwordResetLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/login/2fa', authLimiter, loginVerify2FA);
router.get('/verify/:token', verifyEmail);
router.post('/verify-code', authLimiter, verifyByCode);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.post('/logout-all', authenticate, logoutAll);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.get('/me', authenticate, getMe);

export default router;
