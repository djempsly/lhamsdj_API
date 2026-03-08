import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import * as mc from '../controllers/marketplaceController';

const router = Router();

// Loyalty
router.get('/loyalty/profile', authenticate, mc.getLoyaltyProfile);
router.get('/loyalty/history', authenticate, mc.getLoyaltyHistory);
router.post('/loyalty/redeem', authenticate, mc.redeemPoints);
router.post('/loyalty/referral-code', authenticate, mc.generateReferralCode);

// Flash Sales
router.get('/flash-sales', mc.getActiveFlashSales);
router.get('/flash-sales/admin', authenticate, requireAdmin, mc.getAllFlashSales);
router.post('/flash-sales', authenticate, requireAdmin, mc.createFlashSale);
router.patch('/flash-sales/:id/toggle', authenticate, requireAdmin, mc.toggleFlashSale);
router.delete('/flash-sales/:id', authenticate, requireAdmin, mc.deleteFlashSale);

// Gift Cards
router.post('/gift-cards', authenticate, mc.createGiftCard);
router.post('/gift-cards/validate', authenticate, mc.validateGiftCard);
router.get('/gift-cards/admin', authenticate, requireAdmin, mc.getAllGiftCards);

// Bundles
router.get('/bundles', mc.getBundles);
router.get('/bundles/:slug', mc.getBundleBySlug);
router.post('/bundles', authenticate, requireAdmin, mc.createBundle);
router.delete('/bundles/:id', authenticate, requireAdmin, mc.deleteBundle);

// Q&A
router.get('/questions/:productId', mc.getProductQuestions);
router.post('/questions/:productId', authenticate, mc.askQuestion);
router.patch('/questions/:id/answer', authenticate, requireAdmin, mc.answerQuestion);

// Newsletter
router.post('/newsletter/subscribe', mc.subscribeNewsletter);
router.post('/newsletter/unsubscribe', mc.unsubscribeNewsletter);
router.get('/newsletter/subscribers', authenticate, requireAdmin, mc.getNewsletterSubscribers);
router.post('/newsletter/send-deal', authenticate, requireAdmin, mc.sendDealToSubscribers);

// Deal of the day (Ofertas del día) – public
router.get('/deal-of-the-day', mc.getDealOfTheDay);

// Deal of the day – admin
router.get('/deal-of-the-day/admin', authenticate, requireAdmin, mc.getDealOfTheDayAdmin);
router.post('/deal-of-the-day', authenticate, requireAdmin, mc.addDealProduct);
router.delete('/deal-of-the-day/:id', authenticate, requireAdmin, mc.removeDealProduct);
router.patch('/deal-of-the-day/reorder', authenticate, requireAdmin, mc.reorderDealOfTheDay);

export default router;
