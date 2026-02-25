import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET) : null;

export const VendorPayoutService = {
  /**
   * Create a Stripe Connect account for a vendor.
   * Returns the onboarding URL for the vendor to complete KYC.
   */
  async createConnectAccount(vendorUserId: number) {
    if (!stripe) throw new Error('Stripe not configured');

    const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUserId }, include: { user: true } });
    if (!vendor) throw new Error('Vendor not found');
    if (vendor.stripeAccountId) throw new Error('Stripe account already connected');

    const account = await stripe.accounts.create({
      type: 'express',
      email: vendor.user.email,
      metadata: { vendorId: vendor.id.toString() },
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    });

    await prisma.vendor.update({ where: { id: vendor.id }, data: { stripeAccountId: account.id } });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/stripe/refresh`,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/stripe/complete`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url, accountId: account.id };
  },

  /**
   * Calculate and create payout record for a vendor on a delivered order.
   */
  async calculatePayout(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: { select: { vendorId: true, price: true } } } } },
    });
    if (!order || order.status !== 'DELIVERED') return;

    const vendorTotals = new Map<number, number>();
    for (const item of order.orderItems) {
      if (!item.product.vendorId) continue;
      const current = vendorTotals.get(item.product.vendorId) || 0;
      vendorTotals.set(item.product.vendorId, current + Number(item.price) * item.quantity);
    }

    for (const [vendorId, itemTotal] of vendorTotals) {
      const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
      if (!vendor) continue;

      const commission = Number(vendor.commissionRate) / 100;
      const payoutAmount = Math.round(itemTotal * (1 - commission) * 100) / 100;

      const existing = await prisma.vendorPayout.findFirst({ where: { vendorId, orderId } });
      if (existing) continue;

      await prisma.vendorPayout.create({
        data: { vendorId, orderId, amount: payoutAmount, currency: 'USD', status: 'PENDING' },
      });

      logger.info({ vendorId, orderId, amount: payoutAmount, commission: vendor.commissionRate }, 'Vendor payout calculated');
    }
  },

  /**
   * Process pending payouts via Stripe Connect.
   */
  async processPendingPayouts() {
    if (!stripe) throw new Error('Stripe not configured');

    const pending = await prisma.vendorPayout.findMany({
      where: { status: 'PENDING' },
      include: { vendor: true },
    });

    let processed = 0;
    for (const payout of pending) {
      if (!payout.vendor.stripeAccountId) {
        logger.warn({ vendorId: payout.vendorId }, 'Vendor has no Stripe account, skipping payout');
        continue;
      }

      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(Number(payout.amount) * 100),
          currency: payout.currency.toLowerCase(),
          destination: payout.vendor.stripeAccountId,
          metadata: { payoutId: payout.id.toString(), vendorId: payout.vendorId.toString() },
        });

        await prisma.vendorPayout.update({
          where: { id: payout.id },
          data: { status: 'COMPLETED', stripePayoutId: transfer.id, paidAt: new Date() },
        });

        processed++;
        logger.info({ payoutId: payout.id, transferId: transfer.id }, 'Vendor payout processed');
      } catch (err: any) {
        logger.error({ payoutId: payout.id, err: err.message }, 'Vendor payout failed');
        await prisma.vendorPayout.update({ where: { id: payout.id }, data: { status: 'FAILED' } });
      }
    }

    return processed;
  },

  /**
   * Get payout history for a vendor.
   */
  async getVendorPayouts(vendorUserId: number) {
    const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUserId } });
    if (!vendor) throw new Error('No eres vendedor');

    return await prisma.vendorPayout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },
};
