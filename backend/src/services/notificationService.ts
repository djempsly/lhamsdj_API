import { prisma } from '../lib/prisma';

type NotifType = 'ORDER_UPDATE' | 'SHIPMENT_UPDATE' | 'PROMOTION' | 'SYSTEM' | 'DISPUTE' | 'PAYOUT';

export const NotificationService = {
  async create(userId: number, type: NotifType, title: string, message: string, data?: any) {
    return await prisma.notification.create({
      data: { userId, type, title, message, data: data ? JSON.stringify(data) : null },
    });
  },

  async getMyNotifications(userId: number, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async markAsRead(userId: number, notificationId: number) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: number) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async getUnreadCount(userId: number) {
    return await prisma.notification.count({ where: { userId, isRead: false } });
  },
};
