import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MP_API = 'https://api.mercadopago.com';

export const MercadoPagoService = {
  isConfigured(): boolean {
    return !!MP_ACCESS_TOKEN;
  },

  async createPreference(userId: number, orderId: number) {
    if (!MP_ACCESS_TOKEN) throw new Error('MercadoPago no configurado');

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: { select: { name: true } } } }, user: true },
    });

    if (!order || order.userId !== userId) throw new Error('Orden no encontrada');
    if (order.status !== 'PENDING') throw new Error('La orden no está pendiente');

    const items = order.orderItems.map((item) => ({
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: order.currency || 'USD',
    }));

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const body = {
      items,
      external_reference: orderId.toString(),
      back_urls: {
        success: `${frontendUrl}/payment/success?orderId=${orderId}`,
        failure: `${frontendUrl}/payment/failure?orderId=${orderId}`,
        pending: `${frontendUrl}/payment/pending?orderId=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/payments/mercadopago/webhook`,
    };

    try {
      const res = await fetch(`${MP_API}/checkout/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error creating MercadoPago preference');

      await prisma.order.update({ where: { id: orderId }, data: { paymentId: data.id } });

      logger.info({ orderId, preferenceId: data.id }, 'MercadoPago preference created');
      return { preferenceId: data.id, initPoint: data.init_point, sandboxInitPoint: data.sandbox_init_point };
    } catch (err: any) {
      logger.error({ orderId, err: err.message }, 'MercadoPago preference creation failed');
      throw new Error('Error al crear pago con MercadoPago');
    }
  },

  async handleWebhook(body: any) {
    if (body.type !== 'payment') return;

    try {
      const paymentId = body.data?.id;
      if (!paymentId) return;

      const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const payment = await res.json();

      if (payment.status === 'approved' && payment.external_reference) {
        const orderId = Number(payment.external_reference);

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.paymentStatus === 'COMPLETED') return;

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID', paymentStatus: 'COMPLETED', transactionId: String(paymentId) },
        });

        logger.info({ orderId, mpPaymentId: paymentId }, 'MercadoPago payment approved');
      }
    } catch (err: any) {
      logger.error({ err: err.message }, 'MercadoPago webhook processing failed');
    }
  },
};
