import { prisma } from '../lib/prisma';

export const QuestionService = {
  async create(productId: number, userId: number, question: string) {
    return prisma.productQuestion.create({ data: { productId, userId, question } });
  },

  async getByProduct(productId: number) {
    return prisma.productQuestion.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async answer(id: number, answer: string, answeredBy: number) {
    return prisma.productQuestion.update({
      where: { id },
      data: { answer, answeredBy, answeredAt: new Date() },
    });
  },
};
