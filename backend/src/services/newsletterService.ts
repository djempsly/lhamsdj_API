import { prisma } from '../lib/prisma';
import { DealOfTheDayService } from './dealOfTheDayService';
import { sendEmail } from '../utils/mailer';
import { dealOfTheDayEmail } from '../utils/emailTemplates';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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

  /** Send "ofertas del día" email to all active subscribers. Returns { sent, failed }. */
  async sendDealToSubscribers(): Promise<{ sent: number; failed: number }> {
    const products = await DealOfTheDayService.getActive();
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true },
    });
    const { subject, html } = dealOfTheDayEmail({
      baseUrl: FRONTEND_URL,
      products: products.map((p: any) => ({
        name: p.name,
        slug: p.slug,
        price: String(p.price),
        image: p.image ?? null,
      })),
    });
    let sent = 0;
    let failed = 0;
    for (const sub of subscribers) {
      const ok = await sendEmail(sub.email, subject, html);
      if (ok) sent++;
      else failed++;
    }
    return { sent, failed };
  },
};
