import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import {
  createDispute,
  getMyDisputes,
  getDisputeById,
  addDisputeMessage,
  adminGetDisputes,
  adminUpdateDispute,
} from '../controllers/disputeController';

const router = Router();

router.post('/', authenticate, createDispute);
router.get('/mine', authenticate, getMyDisputes);
router.get('/admin/all', authenticate, requireAdmin, adminGetDisputes);
router.get('/:id', authenticate, getDisputeById);
router.post('/:id/messages', authenticate, addDisputeMessage);
router.patch('/admin/:id', authenticate, requireAdmin, adminUpdateDispute);

export default router;
