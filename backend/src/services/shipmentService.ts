import { prisma } from '../lib/prisma';
import { PaginationResult, buildPaginatedResponse } from '../utils/pagination';
import { ShippingService } from './shippingService';

export const ShipmentService = {
  async createForOrder(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: { select: { vendorId: true } } } } },
    });
    if (!order) throw new Error('Orden no encontrada');

    const vendorGroups = new Map<number | null, boolean>();
    for (const item of order.orderItems) {
      vendorGroups.set(item.product.vendorId, true);
    }

    const shipments = [];
    for (const vendorId of vendorGroups.keys()) {
      const shipment = await prisma.shipment.create({
        data: { orderId, vendorId: vendorId, status: 'PENDING' },
      });
      shipments.push(shipment);
    }
    return shipments;
  },

  async updateTracking(shipmentId: number, vendorUserId: number, data: { carrier: string; trackingNumber: string; trackingUrl?: string | undefined; estimatedDelivery?: string | undefined }) {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId }, include: { vendor: true } });
    if (!shipment) throw new Error('Envío no encontrado');
    if (shipment.vendor && shipment.vendor.userId !== vendorUserId) throw new Error('No autorizado');

    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl ?? null,
        estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null,
        status: 'PICKED_UP',
        shippedAt: new Date(),
      },
    });

    await prisma.shipmentEvent.create({
      data: { shipmentId, status: 'PICKED_UP', details: `Carrier: ${data.carrier}, Tracking: ${data.trackingNumber}` },
    });

    await ShippingService.onShipmentStatusChange(shipmentId, 'PICKED_UP');
    return updated;
  },

  async updateStatus(shipmentId: number, status: string, location?: string, details?: string) {
    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: status as any,
        ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      },
    });

    await prisma.shipmentEvent.create({
      data: { shipmentId, status, location: location ?? null, details: details ?? null },
    });

    if (status === 'DELIVERED') {
      const allShipments = await prisma.shipment.findMany({ where: { orderId: updated.orderId } });
      const allDelivered = allShipments.every((s) => s.status === 'DELIVERED');
      if (allDelivered) {
        await prisma.order.update({ where: { id: updated.orderId }, data: { status: 'DELIVERED' } });
      }
    }

    await ShippingService.onShipmentStatusChange(shipmentId, status);
    return updated;
  },

  async getByOrder(orderId: number) {
    return await prisma.shipment.findMany({
      where: { orderId },
      include: { events: { orderBy: { occurredAt: 'desc' } }, vendor: { select: { businessName: true } } },
    });
  },

  async getVendorShipments(vendorUserId: number, pagination: PaginationResult) {
    const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUserId } });
    if (!vendor) throw new Error('No eres vendedor');
    const where = { vendorId: vendor.id };
    const [data, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: { order: { select: { id: true, total: true, user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.shipment.count({ where }),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },
};
