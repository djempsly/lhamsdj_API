import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { sendMessage, getConversations, getThread, getUnreadCount } from '../controllers/messageController';

const router = Router();
router.post('/', authenticate, sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/thread/:userId', authenticate, getThread);

export default router;
