import { prisma } from '../lib/prisma';

export const NewsletterService = {
  async subscribe(email: string, name?: string, locale?: string) {
    return prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, name: name ?? null, locale: locale || 'en', isActive: true },
      update: {
        isActive: true,
        locale: locale || 'en',
        ...(name !== undefined && { name }),
      },
    });
  },

  async unsubscribe(email: string) {
    return prisma.newsletterSubscriber.update({ where: { email }, data: { isActive: false } });
  },

  async getAll() {
    return prisma.newsletterSubscriber.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  },

  async getCount() {
    return prisma.newsletterSubscriber.count({ where: { isActive: true } });
  },
};
