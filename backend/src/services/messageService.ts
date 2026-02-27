import { prisma } from '../lib/prisma';

export const MessageService = {
  async send(data: { senderId: number; receiverId: number; orderId?: number; subject?: string; body: string }) {
    return prisma.message.create({ data, include: { sender: { select: { id: true, name: true } } } });
  },

  async getConversations(userId: number) {
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true, profileImage: true } },
        receiver: { select: { id: true, name: true, profileImage: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationMap = new Map();
    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          userId: otherId,
          user: msg.senderId === userId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unread: msg.receiverId === userId && !msg.isRead ? 1 : 0,
        });
      } else if (msg.receiverId === userId && !msg.isRead) {
        conversationMap.get(otherId).unread++;
      }
    }
    return Array.from(conversationMap.values());
  },

  async getThread(userId: number, otherUserId: number) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: { sender: { select: { id: true, name: true, profileImage: true } } },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    return messages;
  },

  async getUnreadCount(userId: number) {
    return prisma.message.count({ where: { receiverId: userId, isRead: false } });
  },
};
