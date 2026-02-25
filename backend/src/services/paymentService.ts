import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY must be set in production');
}
const stripe = new Stripe(STRIPE_SECRET || 'sk_test_placeholder', {
  apiVersion: '2026-01-28.clover',
});

export const PaymentService = {
  async createPaymentIntent(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.userId !== userId) throw new Error('Orden no encontrada');
    if (order.status !== 'PENDING') throw new Error('La orden no está pendiente');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: 'usd',
      metadata: { orderId: order.id.toString() },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentId: paymentIntent.id },
    });

    return { clientSecret: paymentIntent.client_secret };
  },

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      logger.error({ err: err.message }, 'Webhook signature verification failed');
      throw new Error(`Webhook Error: ${err.message}`);
    }

    logger.info({ eventType: event.type, eventId: event.id }, 'Stripe webhook received');

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      if (!paymentIntent.metadata.orderId) {
        logger.warn({ paymentIntentId: paymentIntent.id }, 'Payment without orderId in metadata');
        return;
      }

      const orderId = Number(paymentIntent.metadata.orderId);

      // IDEMPOTENCIA: verificar estado actual antes de actualizar
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        logger.warn({ orderId }, 'Order not found for webhook');
        return;
      }
      if (order.paymentStatus === 'COMPLETED') {
        logger.info({ orderId }, 'Order already PAID, skipping duplicate webhook');
        return;
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', paymentStatus: 'COMPLETED' },
      });

      logger.info({ orderId }, 'Order marked as PAID');
    }
  },
};
