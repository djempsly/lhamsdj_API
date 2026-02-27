import { prisma } from '../lib/prisma';
import crypto from 'crypto';

export const GiftCardService = {
  async create(data: {
    value: number;
    recipientEmail?: string;
    buyerId?: number;
    expiresAt?: string;
  }) {
    const code = `GC-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    return prisma.giftCard.create({
      data: {
        code,
        balance: data.value,
        initialValue: data.value,
        buyerId: data.buyerId ?? null,
        recipientEmail: data.recipientEmail ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  },

  async validate(code: string) {
    const card = await prisma.giftCard.findUnique({ where: { code } });
    if (!card || !card.isActive) throw new Error('INVALID_GIFT_CARD');
    if (card.expiresAt && card.expiresAt < new Date()) throw new Error('GIFT_CARD_EXPIRED');
    if (Number(card.balance) <= 0) throw new Error('GIFT_CARD_EMPTY');
    return card;
  },

  async redeem(code: string, amount: number, userId: number) {
    const card = await this.validate(code);
    if (Number(card.balance) < amount) throw new Error('INSUFFICIENT_BALANCE');
    return prisma.giftCard.update({
      where: { code },
      data: { balance: { decrement: amount }, redeemedBy: userId },
    });
  },

  async getAll() {
    return prisma.giftCard.findMany({ orderBy: { createdAt: 'desc' } });
  },
};
