import { prisma } from '../lib/prisma';

export const FlashSaleService = {
  async getActive() {
    const now = new Date();
    return prisma.flashSale.findMany({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gt: now } },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
  },

  async getAll() {
    return prisma.flashSale.findMany({
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        _count: { select: { items: true } },
      },
      orderBy: { startsAt: 'desc' },
    });
  },

  async create(data: {
    name: string;
    discount: number;
    startsAt: string;
    endsAt: string;
    items: { productId: number; salePrice: number; stock: number }[];
  }) {
    return prisma.flashSale.create({
      data: {
        name: data.name,
        discount: data.discount,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        items: { create: data.items },
      },
      include: { items: true },
    });
  },

  async toggle(id: number) {
    const sale = await prisma.flashSale.findUnique({ where: { id } });
    if (!sale) throw new Error('NOT_FOUND');
    return prisma.flashSale.update({ where: { id }, data: { isActive: !sale.isActive } });
  },

  async delete(id: number) {
    return prisma.flashSale.delete({ where: { id } });
  },
};
