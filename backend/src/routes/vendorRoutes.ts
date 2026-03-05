import { Router } from 'express';
import {
  registerVendor, getMyVendorProfile, updateVendorProfile,
  getVendorPublicProfile, getVendorProducts, getVendorDashboard,
  adminGetVendors, adminUpdateVendor,
} from '../controllers/vendorController';
import { createApiKey, listApiKeys, revokeApiKey, getScopes } from '../controllers/vendorApiKeyController';
import { getMyKyc, submitKyc, adminReviewKyc } from '../controllers/vendorKycController';
import { authenticate, requireAdmin, requireVendor } from '../middleware/authMiddleware';
import { apiVendorLimiter } from '../middleware/rateLimiters';

const router = Router();

// Public
router.get('/profile/:slug', getVendorPublicProfile);
router.get('/:vendorId/products', getVendorProducts);

// Vendor self (rate limit 100/min por usuario)
router.post('/register', authenticate, apiVendorLimiter, registerVendor);
router.get('/me', authenticate, requireVendor, apiVendorLimiter, getMyVendorProfile);
router.patch('/me', authenticate, requireVendor, apiVendorLimiter, updateVendorProfile);
router.get('/dashboard', authenticate, requireVendor, apiVendorLimiter, getVendorDashboard);
router.get('/me/kyc', authenticate, requireVendor, getMyKyc);
router.post('/me/kyc', authenticate, requireVendor, submitKyc);
router.get('/me/api-keys/scopes', authenticate, requireVendor, getScopes);
router.get('/me/api-keys', authenticate, requireVendor, listApiKeys);
router.post('/me/api-keys', authenticate, requireVendor, createApiKey);
router.delete('/me/api-keys/:id', authenticate, requireVendor, revokeApiKey);

// Admin
router.get('/admin/all', authenticate, requireAdmin, adminGetVendors);
router.patch('/admin/:id', authenticate, requireAdmin, adminUpdateVendor);
router.post('/admin/kyc/:vendorId/review', authenticate, requireAdmin, adminReviewKyc);

export default router;
