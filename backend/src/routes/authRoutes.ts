import { Router } from 'express';
import {
  register, login, loginVerify2FA, refresh, logout, logoutAll,
  forgotPassword, resetPassword, changePassword, getMe, verifyEmail, verifyByCode,
  magicLinkRequest, magicLinkVerify, oauthGoogleRedirect, oauthGoogleCallback,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { authLimiter, authStrictLimiter, refreshLimiter, passwordResetLimiter, registerLimiter } from '../middleware/rateLimiters';
import { generateCsrfToken } from '../middleware/csrfMiddleware';

const router = Router();

router.get('/csrf', generateCsrfToken);
router.post('/register', registerLimiter, authLimiter, register);
router.post('/login', authStrictLimiter, authLimiter, login);
router.post('/login/2fa', authStrictLimiter, authLimiter, loginVerify2FA);
router.get('/verify/:token', verifyEmail);
router.post('/verify-code', authLimiter, verifyByCode);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.post('/logout-all', authenticate, logoutAll);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getMe);

router.post('/magic-link', authLimiter, magicLinkRequest);
router.get('/magic-link/verify', magicLinkVerify);
router.post('/magic-link/verify', magicLinkVerify);

router.get('/google', oauthGoogleRedirect);
router.get('/google/callback', oauthGoogleCallback);

export default router;
