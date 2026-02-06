import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Usa la versión que te sugiera tu editor
});

export const PaymentService = {
  // 1. Crear intención (Frontend pide permiso para pagar)
  async createPaymentIntent(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.userId !== userId) throw new Error("Orden no encontrada");
    if (order.status !== 'PENDING') throw new Error("La orden no está pendiente");

    // Stripe cobra en centavos
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: 'usd', 
      metadata: { orderId: order.id.toString() } // Guardamos ID para el webhook
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentId: paymentIntent.id }
    });

    return { clientSecret: paymentIntent.client_secret };
  },

  // 2. Webhook (Stripe nos avisa del éxito)
//  




// ... imports

  async handleWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error(`❌ Error de Firma: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // 👇 LOG NUEVO: ¿Qué evento llegó?
    console.log(`📨 Evento Recibido: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // 👇 LOG NUEVO: ¿Qué metadata trae?
      console.log('📦 Metadata:', paymentIntent.metadata);

      console.log(`🔎 ID RECIBIDO: ${paymentIntent.id}`);
  console.log('📦 Metadata:', paymentIntent.metadata);

      if (!paymentIntent.metadata.orderId) {
        console.error('⚠️ El pago llegó sin Order ID.');
        return;
      }

      const orderId = Number(paymentIntent.metadata.orderId);

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'COMPLETED'
        }
      });
      
      console.log(`✅ ¡ORDEN #${orderId} ACTUALIZADA A PAID!`);
    } else {
      // 👇 LOG NUEVO: Si llega otro evento
      console.log(`ℹ️ Ignorando evento tipo: ${event.type}`);
    }
  }
};