import { prisma } from '../lib/prisma';
import shippingManager from '../shipping/shippingManager';
import { ShippingAddress, ShippingPackage, ShippingRate } from '../shipping/types';
import { NotificationService } from './notificationService';
import logger from '../lib/logger';

const DEFAULT_ORIGIN: ShippingAddress = {
  country: process.env.SHIPPING_ORIGIN_COUNTRY || 'US',
  state: process.env.SHIPPING_ORIGIN_STATE || 'FL',
  city: process.env.SHIPPING_ORIGIN_CITY || 'Miami',
  postalCode: process.env.SHIPPING_ORIGIN_ZIP || '33101',
};

export const ShippingService = {
  async estimateRates(addressId: number, userId: number): Promise<ShippingRate[]> {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new Error('Dirección no encontrada');

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { select: { weight: true } } } } },
    });
    if (!cart || cart.items.length === 0) throw new Error('Carrito vacío');

    let totalWeight = 0;
    for (const item of cart.items) {
      const w = item.product.weight ? Number(item.product.weight) : 0.5;
      totalWeight += w * item.quantity;
    }

    const destination: ShippingAddress = {
      country: address.country,
      state: address.state ?? undefined,
      city: address.city,
      postalCode: address.postalCode,
    };

    const pkg: ShippingPackage = { weightKg: totalWeight, items: cart.items.length };
    return await shippingManager.getRates(DEFAULT_ORIGIN, destination, pkg);
  },

  async estimateForCountry(countryCode: string, weightKg: number): Promise<ShippingRate[]> {
    const destination: ShippingAddress = { country: countryCode, city: '', postalCode: '' };
    const pkg: ShippingPackage = { weightKg, items: 1 };
    return await shippingManager.getRates(DEFAULT_ORIGIN, destination, pkg);
  },

  async onShipmentStatusChange(shipmentId: number, newStatus: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: { select: { userId: true, id: true } } },
    });
    if (!shipment) return;

    const statusMessages: Record<string, string> = {
      PICKED_UP: 'Tu pedido ha sido recogido por el transportista.',
      IN_TRANSIT: 'Tu pedido está en camino.',
      OUT_FOR_DELIVERY: 'Tu pedido salió para entrega hoy.',
      DELIVERED: 'Tu pedido ha sido entregado.',
      RETURNED: 'Tu pedido fue devuelto.',
      FAILED: 'Hubo un problema con la entrega de tu pedido.',
    };

    const message = statusMessages[newStatus];
    if (message) {
      await NotificationService.create(
        shipment.order.userId,
        'SHIPMENT_UPDATE',
        `Pedido #${shipment.order.id} - Actualización de envío`,
        message,
        { orderId: shipment.order.id, shipmentId, trackingNumber: shipment.trackingNumber },
      );
      logger.info({ shipmentId, orderId: shipment.orderId, status: newStatus }, 'Shipment notification sent');
    }
  },
};
