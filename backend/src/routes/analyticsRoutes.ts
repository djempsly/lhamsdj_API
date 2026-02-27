import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import * as ac from '../controllers/analyticsController';

const router = Router();

// Analytics (admin)
router.get('/sales', authenticate, requireAdmin, ac.getSalesAnalytics);
router.get('/products', authenticate, requireAdmin, ac.getProductAnalytics);
router.get('/users', authenticate, requireAdmin, ac.getUserAnalytics);
router.get('/vendors/:vendorId', authenticate, requireAdmin, ac.getVendorAnalytics);
router.get('/export', authenticate, requireAdmin, ac.exportReport);

// Tax
router.post('/tax/calculate', ac.calculateTax);
router.get('/tax/rules', authenticate, requireAdmin, ac.getTaxRules);
router.post('/tax/rules', authenticate, requireAdmin, ac.createTaxRule);
router.patch('/tax/rules/:id', authenticate, requireAdmin, ac.updateTaxRule);
router.delete('/tax/rules/:id', authenticate, requireAdmin, ac.deleteTaxRule);

// Legal
router.get('/legal/:slug', ac.getLegalDocument);
router.get('/legal', authenticate, requireAdmin, ac.getAllLegalDocs);
router.post('/legal', authenticate, requireAdmin, ac.upsertLegalDoc);
router.post('/cookie-consent', ac.recordCookieConsent);
router.get('/my-data', authenticate, ac.exportMyData);
router.delete('/my-data', authenticate, ac.deleteMyData);

export default router;
