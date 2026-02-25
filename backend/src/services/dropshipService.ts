import { prisma } from '../lib/prisma';
import { getAdapter } from '../dropshipping/adapterRegistry';
import { NotificationService } from './notificationService';
import logger from '../lib/logger';

export const DropshipService = {
  /**
   * When an order is PAID, check for dropship products and forward to suppliers.
   */
  async fulfillOrder(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: { include: { supplierProducts: { include: { supplier: true } } } } } },
        address: true,
        user: { select: { name: true, phone: true } },
      },
    });

    if (!order) throw new Error('Orden no encontrada');

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
        where: { orderId, orderItemId: item.id },
      });
      if (existing) continue;

      const adapter = getAdapter(supplierLink.supplier.apiType);

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
        await prisma.supplierOrder.create({
          data: {
            supplierId: supplierLink.supplierId,
            orderId,
            orderItemId: item.id,
            status: 'FAILED',
            supplierCost: supplierLink.supplierPrice,
            notes: err.message,
          },
        });
        logger.error({ orderId, supplierId: supplierLink.supplierId, err: err.message }, 'Dropship order failed');
      }
    }

    if (forwarded > 0) {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'PROCESSING' } });
    }

    return forwarded;
  },

  /**
   * Check supplier order statuses and update tracking info.
   */
  async syncSupplierOrders() {
    const pendingOrders = await prisma.supplierOrder.findMany({
      where: { status: { in: ['SENT_TO_SUPPLIER', 'CONFIRMED'] } },
      include: { supplier: true },
    });

    let updated = 0;
    for (const so of pendingOrders) {
      if (!so.externalOrderId) continue;
      const adapter = getAdapter(so.supplier.apiType);

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
            const shipment = await prisma.shipment.findFirst({ where: { orderId: so.orderId, vendorId: null } });
            if (shipment) {
              await prisma.shipment.update({
                where: { id: shipment.id },
                data: { trackingNumber: result.trackingNumber, carrier: so.supplier.name, status: 'IN_TRANSIT', shippedAt: new Date() },
              });
            }
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
};

function mapSupplierStatus(status: string): any {
  const map: Record<string, string> = {
    pending: 'PENDING', processing: 'CONFIRMED', confirmed: 'CONFIRMED',
    shipped: 'SHIPPED', delivered: 'DELIVERED', cancelled: 'CANCELLED', failed: 'FAILED',
  };
  return map[status.toLowerCase()] || 'CONFIRMED';
}
