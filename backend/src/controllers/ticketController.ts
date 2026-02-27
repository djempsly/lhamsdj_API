import { Request, Response } from 'express';
import { TicketService } from '../services/ticketService';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description, priority } = req.body;
    if (!subject || !description) return res.status(400).json({ success: false, message: 'subject and description required' });
    const ticket = await TicketService.create({ userId: req.user!.id, subject, description, priority });
    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const data = await TicketService.getMyTickets(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'SUPPORT';
    const ticket = await TicketService.getById(Number(req.params.id), isStaff ? undefined : req.user!.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTicketResponse = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'message required' });
    const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'SUPPORT';
    const response = await TicketService.addResponse(Number(req.params.id), req.user!.id, message, isStaff);
    res.status(201).json({ success: true, data: response });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminGetTickets = async (req: Request, res: Response) => {
  try {
    const result = await TicketService.adminGetAll({
      status: req.query.status as string,
      priority: req.query.priority as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const ticket = await TicketService.updateStatus(Number(req.params.id), req.body.status);
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
