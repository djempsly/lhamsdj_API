import { prisma } from '../lib/prisma';
import { getAdapter } from '../dropshipping/adapterRegistry';

function resolveAdapterKey(supplier: { id: number; apiType: string }): string {
  return supplier.apiType === 'CUSTOM_API' ? `CUSTOM_${supplier.id}` : supplier.apiType;
}
import { NotificationService } from './notificationService';
import { ShipmentService } from './shipmentService';
import { sendEmail } from '../utils/mailer';
import { shippingUpdateEmail } from '../utils/emailTemplates';
import logger from '../lib/logger';

const MAX_RETRIES = 5;
const RETRY_DELAYS = [60, 300, 900, 3600, 7200]; // seconds: 1m, 5m, 15m, 1h, 2h

export const DropshipService = {
  async fulfillOrder(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: { include: { supplierProducts: { include: { supplier: true } } } } } },
        address: true,
        user: { select: { name: true, phone: true, email: true } },
      },
    });

    if (!order) throw new Error('Order not found');

    const shippingAddress = {
      name: order.user.name,
      street: order.address.street,
      city: order.address.city,
      state: order.address.state || undefined,
      postalCode: order.address.postalCode,
      country: order.address.country,
      phone: order.user.phone || undefined,
    };

    let forwarded = 0;
    for (const item of order.orderItems) {
      const supplierLink = item.product.supplierProducts.find((sp) => sp.isActive && sp.supplier.status === 'ACTIVE');
      if (!supplierLink) continue;

      const existing = await prisma.supplierOrder.findFirst({
        where: { orderId: order.id, orderItemId: item.id, status: { notIn: ['FAILED', 'CANCELLED'] } },
      });
      if (existing) continue;

      const adapter = getAdapter(resolveAdapterKey(supplierLink.supplier));

      try {
        const result = await adapter.placeOrder({
          supplierSku: supplierLink.supplierSku,
          quantity: item.quantity,
          shippingAddress,
        });

        await prisma.supplierOrder.create({
          data: {
            supplierId: supplierLink.supplierId,
            orderId,
            orderItemId: item.id,
            externalOrderId: result.externalOrderId,
            status: result.status === 'CONFIRMED' ? 'CONFIRMED' : 'SENT_TO_SUPPLIER',
            supplierCost: supplierLink.supplierPrice,
            trackingNumber: result.trackingNumber ?? null,
            sentAt: new Date(),
          },
        });

        forwarded++;
        logger.info({ orderId, supplierId: supplierLink.supplierId, externalOrderId: result.externalOrderId }, 'Dropship order placed');
      } catch (err: any) {
        const nextRetryAt = new Date(Date.now() + RETRY_DELAYS[0]! * 1000);
        await prisma.supplierOrder.create({
          data: {
            supplierId: supplierLink.supplierId,
            orderId,
            orderItemId: item.id,
            status: 'FAILED',
            supplierCost: supplierLink.supplierPrice,
            notes: err.message,
            retryCount: 0,
            nextRetryAt,
          },
        });
        logger.error({ orderId, supplierId: supplierLink.supplierId, err: err.message, nextRetryAt }, 'Dropship order failed, scheduled for retry');
      }
    }

    if (forwarded > 0) {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'PROCESSING' } });
    }

    return forwarded;
  },

  async retryFailedOrders() {
    const failedOrders = await prisma.supplierOrder.findMany({
      where: {
        status: 'FAILED',
        retryCount: { lt: MAX_RETRIES },
        nextRetryAt: { lte: new Date() },
      },
      include: { supplier: true },
    });

    let retried = 0;
    for (const so of failedOrders) {
      if (!so.orderItemId) continue;

      const order = await prisma.order.findUnique({
        where: { id: so.orderId },
        include: {
          orderItems: { where: { id: so.orderItemId }, include: { product: { include: { supplierProducts: { where: { supplierId: so.supplierId } } } } } },
          address: true,
          user: { select: { name: true, phone: true } },
        },
      });
      if (!order?.address) continue;

      const item = order.orderItems[0];
      if (!item) continue;
      const supplierLink = item.product.supplierProducts[0];
      if (!supplierLink) continue;

      const adapter = getAdapter(resolveAdapterKey(so.supplier));

      try {
        const result = await adapter.placeOrder({
          supplierSku: supplierLink.supplierSku,
          quantity: item.quantity,
          shippingAddress: {
            name: order.user.name,
            street: order.address.street,
            city: order.address.city,
            state: order.address.state || undefined,
            postalCode: order.address.postalCode,
            country: order.address.country,
            phone: order.user.phone || undefined,
          },
        });

        await prisma.supplierOrder.update({
          where: { id: so.id },
          data: {
            status: result.status === 'CONFIRMED' ? 'CONFIRMED' : 'SENT_TO_SUPPLIER',
            externalOrderId: result.externalOrderId,
            trackingNumber: result.trackingNumber ?? null,
            sentAt: new Date(),
            nextRetryAt: null,
            notes: `Succeeded on retry #${so.retryCount + 1}`,
          },
        });

        retried++;
        logger.info({ supplierOrderId: so.id, retry: so.retryCount + 1 }, 'Retry succeeded');
      } catch (err: any) {
        const newCount = so.retryCount + 1;
        const delayIdx = Math.min(newCount, RETRY_DELAYS.length - 1);
        const nextRetry = newCount < MAX_RETRIES ? new Date(Date.now() + (RETRY_DELAYS[delayIdx] ?? 3600) * 1000) : null;

        await prisma.supplierOrder.update({
          where: { id: so.id },
          data: {
            retryCount: newCount,
            nextRetryAt: nextRetry,
            notes: `Retry #${newCount} failed: ${err.message}`,
            status: newCount >= MAX_RETRIES ? 'CANCELLED' : 'FAILED',
          },
        });

        logger.warn({ supplierOrderId: so.id, retry: newCount, maxRetries: MAX_RETRIES }, newCount >= MAX_RETRIES ? 'All retries exhausted, cancelled' : 'Retry failed, rescheduled');
      }
    }

    if (retried > 0) logger.info({ retried }, 'Failed orders retried');
    return retried;
  },

  async syncSupplierOrders() {
    const pendingOrders = await prisma.supplierOrder.findMany({
      where: { status: { in: ['SENT_TO_SUPPLIER', 'CONFIRMED', 'SHIPPED'] } },
      include: { supplier: true },
    });

    let updated = 0;
    for (const so of pendingOrders) {
      if (!so.externalOrderId) continue;
      const adapter = getAdapter(resolveAdapterKey(so.supplier));

      try {
        const result = await adapter.getOrderStatus(so.externalOrderId);
        const newStatus = mapSupplierStatus(result.status);

        if (newStatus !== so.status || (result.trackingNumber && result.trackingNumber !== so.trackingNumber)) {
          await prisma.supplierOrder.update({
            where: { id: so.id },
            data: {
              status: newStatus,
              trackingNumber: result.trackingNumber ?? so.trackingNumber,
              confirmedAt: newStatus === 'SHIPPED' ? new Date() : so.confirmedAt,
            },
          });

          if (result.trackingNumber && result.trackingNumber !== so.trackingNumber) {
            await this.updateShipmentTracking(so.orderId, result.trackingNumber, so.supplier.name);
          }

          updated++;
        }
      } catch (err) {
        logger.debug({ supplierOrderId: so.id }, 'Supplier order sync skipped');
      }
    }

    if (updated > 0) logger.info({ updated }, 'Supplier orders synced');
    return updated;
  },

  async updateShipmentTracking(orderId: number, trackingNumber: string, carrier: string) {
    const shipment = await prisma.shipment.findFirst({ where: { orderId, vendorId: null } });
    if (!shipment) return;

    await prisma.shipment.update({
      where: { id: shipment.id },
      data: { trackingNumber, carrier, status: 'IN_TRANSIT', shippedAt: new Date() },
    });

    await prisma.shipmentEvent.create({
      data: { shipmentId: shipment.id, status: 'IN_TRANSIT', details: `Tracking: ${trackingNumber} via ${carrier}` },
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { email: true, name: true } } },
    });
    if (!order) return;

    const emailData = shippingUpdateEmail({ orderId, status: 'IN_TRANSIT', trackingNumber, carrier });
    await sendEmail(order.user.email, emailData.subject, emailData.html);
    await NotificationService.create(order.userId, 'SHIPMENT_UPDATE', emailData.subject, `Your order is on its way! Tracking: ${trackingNumber}`, { orderId, trackingNumber, carrier });
    logger.info({ orderId, trackingNumber, carrier }, 'Customer notified with tracking');
  },

  async handleSupplierWebhook(supplierId: number, payload: { externalOrderId: string; status?: string; trackingNumber?: string; carrier?: string }) {
    const supplierOrder = await prisma.supplierOrder.findFirst({
      where: { supplierId, externalOrderId: payload.externalOrderId },
      include: { supplier: true },
    });
    if (!supplierOrder) {
      logger.warn({ supplierId, externalOrderId: payload.externalOrderId }, 'Supplier webhook: order not found');
      return null;
    }

    const updates: any = {};
    if (payload.status) updates.status = mapSupplierStatus(payload.status);
    if (payload.trackingNumber) updates.trackingNumber = payload.trackingNumber;
    if (payload.status?.toLowerCase() === 'shipped') updates.confirmedAt = new Date();

    await prisma.supplierOrder.update({ where: { id: supplierOrder.id }, data: updates });

    if (payload.trackingNumber) {
      await this.updateShipmentTracking(
        supplierOrder.orderId,
        payload.trackingNumber,
        payload.carrier || supplierOrder.supplier.name,
      );
    }

    if (payload.status?.toLowerCase() === 'delivered') {
      await ShipmentService.updateStatus(
        (await prisma.shipment.findFirst({ where: { orderId: supplierOrder.orderId, vendorId: null } }))?.id ?? 0,
        'DELIVERED',
      );
    }

    logger.info({ supplierId, externalOrderId: payload.externalOrderId, updates }, 'Supplier webhook processed');
    return supplierOrder;
  },
};

function mapSupplierStatus(status: string): any {
  const map: Record<string, string> = {
    pending: 'PENDING', processing: 'CONFIRMED', confirmed: 'CONFIRMED',
    shipped: 'SHIPPED', delivered: 'DELIVERED', cancelled: 'CANCELLED', failed: 'FAILED',
    in_transit: 'SHIPPED', out_for_delivery: 'SHIPPED',
  };
  return map[status.toLowerCase()] || 'CONFIRMED';
}
