import { Router } from 'express';
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

const router = Router();

// Auth & Users
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/2fa', twoFactorRoutes);

// Catalog
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/variants', variantRoutes);
router.use('/product-images', productImageRoutes);

// Shopping
router.use('/search', searchRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/wishlist', wishlistRoutes);

// Marketplace
router.use('/vendors', vendorRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/vendor-payouts', vendorPayoutRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/shipping', shippingRoutes);
router.use('/currencies', currencyRoutes);

// Engagement
router.use('/marketplace', marketplaceRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/disputes', disputeRoutes);
router.use('/messages', messageRoutes);
router.use('/tickets', ticketRoutes);

// Admin
router.use('/stats', statsRoutes);
router.use('/audit', auditRoutes);
router.use('/analytics', analyticsRoutes);

// Uploads
router.use('/uploads', uploadRoutes);
router.use('/addresses', addressRoutes);

export default router;
