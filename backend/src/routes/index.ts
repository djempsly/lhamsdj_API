import { Router } from 'express';
import { apiPrivateLimiter } from '../middleware/rateLimiters';
import { verifyCsrf } from '../middleware/csrfMiddleware';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import addressRoutes from './addressRoutes';
import orderRoutes from './orderRoutes';
import reviewRoutes from './reviewRoutes';
import uploadRoutes from './uploadRoutes';
import paymentRoutes from './paymentRoutes';
import variantRoutes from './variantRoutes';
import productImageRoutes from './productImageRoutes';
import vendorRoutes from './vendorRoutes';
import supplierRoutes from './supplierRoutes';
import vendorPayoutRoutes from './vendorPayoutRoutes';
import shipmentRoutes from './shipmentRoutes';
import shippingRoutes from './shippingRoutes';
import currencyRoutes from './currencyRoutes';
import couponRoutes from './couponRoutes';
import wishlistRoutes from './wishlistRoutes';
import notificationRoutes from './notificationRoutes';
import statsRoutes from './statsRoutes';
import auditRoutes from './auditRoutes';
import disputeRoutes from './disputeRoutes';
import twoFactorRoutes from './twoFactorRoutes';
import searchRoutes from './searchRoutes';
import messageRoutes from './messageRoutes';
import ticketRoutes from './ticketRoutes';
import marketplaceRoutes from './marketplaceRoutes';
import analyticsRoutes from './analyticsRoutes';
import securityRoutes from './securityRoutes';

const router = Router();

router.use(verifyCsrf);

// apiPrivateLimiter (100 req/min) only on routes that are fully protected (auth required).
// Public read routes (products, categories, search, currencies, suppliers webhook) keep global 200/min.
// Auth & Users
router.use('/auth', apiPrivateLimiter, authRoutes);
router.use('/users', apiPrivateLimiter, userRoutes);
router.use('/2fa', apiPrivateLimiter, twoFactorRoutes);

// Catalog (GET public; write protected - limiter applies to whole path, so no limiter here to avoid limiting public browse)
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/variants', apiPrivateLimiter, variantRoutes);
router.use('/product-images', productImageRoutes);

// Shopping (search has public GET; cart/orders/payments/wishlist/coupons fully protected)
router.use('/search', searchRoutes);
router.use('/cart', apiPrivateLimiter, cartRoutes);
router.use('/orders', apiPrivateLimiter, orderRoutes);
router.use('/payments', apiPrivateLimiter, paymentRoutes);
router.use('/coupons', apiPrivateLimiter, couponRoutes);
router.use('/wishlist', apiPrivateLimiter, wishlistRoutes);

// Marketplace (suppliers has public webhook; rest protected)
router.use('/vendors', apiPrivateLimiter, vendorRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/vendor-payouts', apiPrivateLimiter, vendorPayoutRoutes);
router.use('/shipments', apiPrivateLimiter, shipmentRoutes);
router.use('/shipping', apiPrivateLimiter, shippingRoutes);
router.use('/currencies', currencyRoutes);

// Engagement
router.use('/marketplace', apiPrivateLimiter, marketplaceRoutes);
router.use('/reviews', apiPrivateLimiter, reviewRoutes);
router.use('/notifications', apiPrivateLimiter, notificationRoutes);
router.use('/disputes', apiPrivateLimiter, disputeRoutes);
router.use('/messages', apiPrivateLimiter, messageRoutes);
router.use('/tickets', apiPrivateLimiter, ticketRoutes);

// Admin
router.use('/stats', apiPrivateLimiter, statsRoutes);
router.use('/audit', apiPrivateLimiter, auditRoutes);
router.use('/analytics', apiPrivateLimiter, analyticsRoutes);
router.use('/security', apiPrivateLimiter, securityRoutes);

// Uploads
router.use('/uploads', apiPrivateLimiter, uploadRoutes);
router.use('/addresses', apiPrivateLimiter, addressRoutes);

export default router;
