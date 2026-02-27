import { prisma } from '../lib/prisma';

export const LegalService = {
  async getDocument(slug: string) {
    return prisma.legalDocument.findFirst({ where: { slug, isActive: true } });
  },

  async getAll() {
    return prisma.legalDocument.findMany({ orderBy: { slug: 'asc' } });
  },

  async upsert(data: { slug: string; titleEn: string; titleFr: string; titleEs: string; contentEn: string; contentFr: string; contentEs: string }) {
    return prisma.legalDocument.upsert({
      where: { slug: data.slug },
      create: data,
      update: { ...data, version: { increment: 1 } },
    });
  },

  async recordConsent(data: { userId?: number; sessionId?: string; analytics: boolean; marketing: boolean; functional: boolean; ip?: string }) {
    return prisma.cookieConsent.create({ data });
  },

  async getUserConsent(userId: number) {
    return prisma.cookieConsent.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  async exportUserData(userId: number) {
    const [user, orders, reviews, addresses, wishlist] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, phone: true, createdAt: true } }),
      prisma.order.findMany({ where: { userId }, include: { orderItems: true } }),
      prisma.review.findMany({ where: { userId } }),
      prisma.address.findMany({ where: { userId } }),
      prisma.wishlistItem.findMany({ where: { userId }, include: { product: { select: { name: true } } } }),
    ]);
    return { user, orders, reviews, addresses, wishlist };
  },

  async deleteUserData(userId: number) {
    await prisma.$transaction([
      prisma.review.deleteMany({ where: { userId } }),
      prisma.wishlistItem.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.cartItem.deleteMany({ where: { cart: { userId } } }),
      prisma.user.update({
        where: { id: userId },
        data: { name: 'Deleted User', email: `deleted-${userId}@deleted.com`, phone: null, profileImage: null, isActive: false },
      }),
    ]);
  },
};
