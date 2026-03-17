import { prisma } from '../lib/prisma';

export const TagService = {
  async search(query: string) {
    return await prisma.tag.findMany({
      where: query ? { name: { contains: query, mode: 'insensitive' } } : {},
      orderBy: { name: 'asc' },
      take: 30,
    });
  },

  async create(name: string) {
    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) return existing;
    return await prisma.tag.create({ data: { name } });
  },

  async setProductTags(productId: number, tagIds: number[]) {
    await prisma.productTag.deleteMany({ where: { productId } });
    if (tagIds.length > 0) {
      await prisma.productTag.createMany({
        data: tagIds.map(tagId => ({ productId, tagId })),
      });
    }
    return await prisma.productTag.findMany({
      where: { productId },
      include: { tag: true },
    });
  },

  async getProductTags(productId: number) {
    const productTags = await prisma.productTag.findMany({
      where: { productId },
      include: { tag: true },
    });
    return productTags.map(pt => pt.tag);
  },
};
