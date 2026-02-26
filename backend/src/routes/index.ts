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

const router = Router();

// Auth & Users
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Catalog
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/variants', variantRoutes);
router.use('/product-images', productImageRoutes);

// Shopping
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
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);

// Admin
router.use('/stats', statsRoutes);
router.use('/audit', auditRoutes);

// Uploads
router.use('/uploads', uploadRoutes);
router.use('/addresses', addressRoutes);

export default router;
