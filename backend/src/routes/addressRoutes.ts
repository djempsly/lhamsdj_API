import { Router } from 'express';
import { createAddress, getMyAddresses, deleteAddress } from '../controllers/addressController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Todas requieren autenticación
router.post('/', authenticate, createAddress);
router.get('/', authenticate, getMyAddresses);
router.delete('/:id', authenticate, deleteAddress);
router.delete('/:id', authenticate, requireAdmin, deleteAddress);


export default router;