import { Router } from 'express';
import {
  registerVendor, getMyVendorProfile, updateVendorProfile,
  getVendorPublicProfile, getVendorProducts, getVendorDashboard,
  adminGetVendors, adminUpdateVendor,
} from '../controllers/vendorController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/profile/:slug', getVendorPublicProfile);
router.get('/:vendorId/products', getVendorProducts);

// Vendor self
router.post('/register', authenticate, registerVendor);
router.get('/me', authenticate, getMyVendorProfile);
router.patch('/me', authenticate, updateVendorProfile);
router.get('/dashboard', authenticate, getVendorDashboard);

// Admin
router.get('/admin/all', authenticate, requireAdmin, adminGetVendors);
router.patch('/admin/:id', authenticate, requireAdmin, adminUpdateVendor);

export default router;
