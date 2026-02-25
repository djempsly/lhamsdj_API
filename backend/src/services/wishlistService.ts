import { prisma } from '../lib/prisma';

export const WishlistService = {
  async toggle(userId: number, productId: number) {
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { added: false };
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new Error('Producto no encontrado');

    await prisma.wishlistItem.create({ data: { userId, productId } });
    return { added: true };
  },

  async getMyWishlist(userId: number) {
    return await prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { images: { take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async isInWishlist(userId: number, productId: number) {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!item;
  },
};
