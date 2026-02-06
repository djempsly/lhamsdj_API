import { Router } from 'express';
import { getMyProfile, updateMyProfile, deleteMyAccount, getAllUsers, toggleUserStatus } from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Rutas Self (Requieren login)
router.get('/profile', authenticate, getMyProfile);
router.patch('/profile', authenticate, updateMyProfile);
router.delete('/profile', authenticate, deleteMyAccount);

// Rutas Admin (Requieren login + admin)
router.get('/', authenticate, requireAdmin, getAllUsers);
router.patch('/:id/status', authenticate, requireAdmin, toggleUserStatus);

export default router;