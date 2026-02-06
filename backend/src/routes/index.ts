// import { Router } from 'express';
// import authRoutes from './authRoutes';
// import userRoutes from './userRoutes';
// import categoryRoutes from './categoryRoutes'; 
// import productRoutes from './productRoutes'
// import cartRoutes from './cartRoutes';
// import addressRoutes from './addressRoutes'; 
// import orderRoutes from './orderRoutes'; 
// import reviewRoutes from './reviewRoutes';




// const router = Router();

// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/categories', categoryRoutes); 
// router.use('/products', productRoutes); 
// router.use('/cart', cartRoutes); 
// router.use('/addresses', addressRoutes); 
// router.use('/orders', orderRoutes); 
// router.use('/reviews', reviewRoutes);


// export default router;


import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import categoryRoutes from './categoryRoutes'; 
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import addressRoutes from './addressRoutes'; 
import orderRoutes from './orderRoutes'; 
import reviewRoutes from './reviewRoutes';
import uploadRoutes from './uploadRoutes';       // <--- Nuevo
import paymentRoutes from './paymentRoutes';     // <--- Nuevo
import variantRoutes from './variantRoutes';     // <--- Nuevo
import productImageRoutes from './productImageRoutes'; // <--- Nuevo




const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);``
router.use('/categories', categoryRoutes); 
router.use('/products', productRoutes); 
router.use('/cart', cartRoutes); 
router.use('/addresses', addressRoutes); 
router.use('/orders', orderRoutes); 
router.use('/reviews', reviewRoutes);

// Nuevas rutas registradas
router.use('/uploads', uploadRoutes);
router.use('/payments', paymentRoutes);
router.use('/variants', variantRoutes);
router.use('/product-images', productImageRoutes);

export default router;
