import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, orderId, subject, body } = req.body;
    if (!receiverId || !body) return res.status(400).json({ success: false, message: 'receiverId and body required' });
    const msg = await MessageService.send({ senderId: req.user!.id, receiverId, orderId, subject, body });
    res.status(201).json({ success: true, data: msg });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const data = await MessageService.getConversations(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getThread = async (req: Request, res: Response) => {
  try {
    const data = await MessageService.getThread(req.user!.id, Number(req.params.userId));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await MessageService.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
