import { prisma } from '../lib/prisma';
import { NotificationService } from './notificationService';

export const DisputeService = {
  async create(data: { orderId: number; userId: number; type: string; description: string }) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, userId: data.userId },
      include: { orderItems: { include: { product: true } } },
    });
    if (!order) throw new Error('ORDER_NOT_FOUND');
    if (!['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status)) throw new Error('ORDER_NOT_ELIGIBLE');

    const vendorId = order.orderItems[0]?.product?.vendorId || undefined;

    const dispute = await prisma.dispute.create({
      data: {
        orderId: data.orderId,
        userId: data.userId,
        vendorId: vendorId ?? null,
        type: data.type as any,
        description: data.description,
      },
      include: { order: true, user: { select: { id: true, name: true, email: true } } },
    });

    if (vendorId) {
      const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
      if (vendor) {
        await NotificationService.create(
          vendor.userId,
          'DISPUTE',
          'New dispute opened',
          `A dispute has been opened for order #${data.orderId}`,
          { disputeId: dispute.id, orderId: data.orderId }
        );
      }
    }

    return dispute;
  },

  async getMyDisputes(userId: number) {
    return prisma.dispute.findMany({
      where: { userId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: number, userId?: number) {
    const where: any = { id };
    if (userId) where.userId = userId;
    return prisma.dispute.findFirst({
      where,
      include: {
        order: { include: { orderItems: { include: { product: true } } } },
        user: { select: { id: true, name: true, email: true } },
        vendor: { select: { id: true, businessName: true } },
        messages: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  async addMessage(disputeId: number, userId: number, message: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

    return prisma.disputeMessage.create({
      data: { disputeId, userId, message },
    });
  },

  async adminGetAll(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          order: true,
          user: { select: { id: true, name: true, email: true } },
          vendor: { select: { id: true, businessName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dispute.count({ where }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  },

  async updateStatus(id: number, status: string, resolution?: string) {
    const data: any = { status };
    if (resolution) data.resolution = resolution;
    if (status === 'RESOLVED' || status === 'CLOSED') data.resolvedAt = new Date();

    const dispute = await prisma.dispute.update({ where: { id }, data });

    await NotificationService.create(
      dispute.userId,
      'DISPUTE',
      `Dispute ${status.toLowerCase()}`,
      resolution || `Your dispute #${id} has been ${status.toLowerCase()}`,
      { disputeId: id }
    );

    return dispute;
  },

  async getVendorDisputes(vendorId: number) {
    return prisma.dispute.findMany({
      where: { vendorId },
      include: { order: true, user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },
};
