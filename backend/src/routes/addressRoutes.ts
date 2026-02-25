import { Router } from 'express';
import { createAddress, getMyAddresses, deleteAddress } from '../controllers/addressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Todas requieren autenticación. Usuario solo puede borrar sus propias direcciones (AddressService.delete valida userId).
router.post('/', authenticate, createAddress);
router.get('/', authenticate, getMyAddresses);
router.delete('/:id', authenticate, deleteAddress);


export default router;