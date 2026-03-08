import { prisma } from '../lib/prisma';

export const DealOfTheDayService = {
  /** Public: get products currently in "ofertas del día" for slider */
  async getActive() {
    const rows = await prisma.dealOfTheDay.findMany({
      orderBy: { position: 'asc' },
      include: {
        product: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            description: true,
            images: { take: 1, orderBy: { id: 'asc' }, select: { url: true } },
          },
        },
      },
    });
    return rows
      .filter((r) => r.product != null)
      .map((r) => ({
        ...r.product!,
        image: (r.product as any).images?.[0]?.url ?? null,
        images: undefined,
      }));
  },

  /** Admin: list current deal products with full product info */
  async list() {
    return prisma.dealOfTheDay.findMany({
      orderBy: { position: 'asc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            isActive: true,
            images: { take: 1, select: { url: true } },
          },
        },
      },
    });
  },

  async add(productId: number) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');
    const existing = await prisma.dealOfTheDay.findUnique({ where: { productId } });
    if (existing) throw new Error('Product already in deal of the day');
    const max = await prisma.dealOfTheDay.aggregate({ _max: { position: true } });
    const position = (max._max.position ?? -1) + 1;
    return prisma.dealOfTheDay.create({
      data: { productId, position },
      include: { product: { select: { id: true, name: true, slug: true, price: true } } },
    });
  },

  async remove(id: number) {
    await prisma.dealOfTheDay.delete({ where: { id } });
  },

  async removeByProductId(productId: number) {
    await prisma.dealOfTheDay.deleteMany({ where: { productId } });
  },

  /** Reorder: body is array of dealOfTheDay ids in desired order */
  async reorder(ids: number[]) {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.dealOfTheDay.update({ where: { id }, data: { position: index } })
      )
    );
    return this.list();
  },
};
