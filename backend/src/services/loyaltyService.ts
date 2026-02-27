import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const POINTS_PER_DOLLAR = 10;
const TIER_THRESHOLDS = { BRONZE: 0, SILVER: 1000, GOLD: 5000, PLATINUM: 15000 };

function getTier(points: number): string {
  if (points >= TIER_THRESHOLDS.PLATINUM) return 'PLATINUM';
  if (points >= TIER_THRESHOLDS.GOLD) return 'GOLD';
  if (points >= TIER_THRESHOLDS.SILVER) return 'SILVER';
  return 'BRONZE';
}

export const LoyaltyService = {
  async awardPoints(userId: number, amount: number, orderId?: number) {
    const points = Math.floor(amount * POINTS_PER_DOLLAR);
    const user = await prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: points } },
    });
    const newTier = getTier(user.loyaltyPoints);
    if (newTier !== user.loyaltyTier) {
      await prisma.user.update({ where: { id: userId }, data: { loyaltyTier: newTier } });
    }
    await prisma.loyaltyTransaction.create({
      data: { userId, points, type: 'EARNED', description: `Earned from order`, orderId: orderId ?? null },
    });
    return { points, totalPoints: user.loyaltyPoints, tier: newTier };
  },

  async redeemPoints(userId: number, points: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.loyaltyPoints < points) throw new Error('INSUFFICIENT_POINTS');
    await prisma.user.update({ where: { id: userId }, data: { loyaltyPoints: { decrement: points } } });
    await prisma.loyaltyTransaction.create({
      data: { userId, points: -points, type: 'REDEEMED', description: 'Points redeemed for discount' },
    });
    return { discount: points / POINTS_PER_DOLLAR, remainingPoints: user.loyaltyPoints - points };
  },

  async getHistory(userId: number) {
    return prisma.loyaltyTransaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  },

  async generateReferralCode(userId: number) {
    const code = `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
    return code;
  },

  async processReferral(newUserId: number, referralCode: string) {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (!referrer) return;
    await prisma.user.update({ where: { id: newUserId }, data: { referredBy: referrer.id } });
    await this.awardPoints(referrer.id, 10);
    await this.awardPoints(newUserId, 5);
  },

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true, loyaltyTier: true, referralCode: true },
    });
    return { ...user, tiers: TIER_THRESHOLDS };
  },
};
