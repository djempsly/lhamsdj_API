import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await NotificationService.getMyNotifications(req.user?.id!, unreadOnly);
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user?.id!);
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    await NotificationService.markAsRead(req.user?.id!, Number(req.params.id));
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.user?.id!);
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
