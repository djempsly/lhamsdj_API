import { Router } from 'express';
import { authenticate, requireSupport } from '../middleware/authMiddleware';
import { createTicket, getMyTickets, getTicketById, addTicketResponse, adminGetTickets, updateTicketStatus } from '../controllers/ticketController';

const router = Router();
router.post('/', authenticate, createTicket);
router.get('/mine', authenticate, getMyTickets);
router.get('/admin/all', authenticate, requireSupport, adminGetTickets);
router.get('/:id', authenticate, getTicketById);
router.post('/:id/respond', authenticate, addTicketResponse);
router.patch('/admin/:id/status', authenticate, requireSupport, updateTicketStatus);

export default router;
