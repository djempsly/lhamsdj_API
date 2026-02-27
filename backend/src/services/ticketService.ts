import { prisma } from '../lib/prisma';

export const TicketService = {
  async create(data: { userId: number; subject: string; description: string; priority?: string }) {
    return prisma.supportTicket.create({
      data: { userId: data.userId, subject: data.subject, description: data.description, priority: data.priority || 'MEDIUM' },
    });
  },

  async getMyTickets(userId: number) {
    return prisma.supportTicket.findMany({
      where: { userId },
      include: { _count: { select: { responses: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getById(id: number, userId?: number) {
    const where: any = { id };
    if (userId) where.userId = userId;
    return prisma.supportTicket.findFirst({
      where,
      include: { responses: { orderBy: { createdAt: 'asc' } }, user: { select: { id: true, name: true, email: true } } },
    });
  },

  async addResponse(ticketId: number, userId: number, message: string, isStaff: boolean) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error('TICKET_NOT_FOUND');
    if (!isStaff && ticket.userId !== userId) throw new Error('FORBIDDEN');

    const [response] = await prisma.$transaction([
      prisma.ticketResponse.create({ data: { ticketId, userId, message, isStaff } }),
      prisma.supportTicket.update({ where: { id: ticketId }, data: { status: isStaff ? 'ANSWERED' : 'WAITING' } }),
    ]);
    return response;
  },

  async adminGetAll(params: { status?: string; priority?: string; page?: number; limit?: number }) {
    const { status, priority, page = 1, limit = 20 } = params;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [data, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { responses: true } } },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  },

  async updateStatus(id: number, status: string) {
    return prisma.supportTicket.update({ where: { id }, data: { status } });
  },
};
