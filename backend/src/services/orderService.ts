import { OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { PaginationResult, buildPaginatedResponse } from '../utils/pagination';
import { ShipmentService } from './shipmentService';
import { CouponService } from './couponService';
import { NotificationService } from './notificationService';
import { sendEmail } from '../utils/mailer';
import { orderConfirmationEmail } from '../utils/emailTemplates';

type OrderStatusType = OrderStatus;

interface CreateOrderData {
  addressId: number;
  shippingCost?: number | undefined;
  shippingService?: string | undefined;
  couponCode?: string | undefined;
}

export const OrderService = {
  async createOrder(userId: number, data: CreateOrderData) {
    const { addressId, shippingCost = 0, shippingService, couponCode } = data;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, productVariant: true } } },
    });
    if (!cart || cart.items.length === 0) throw new Error('El carrito está vacío.');

    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new Error('Dirección no válida.');

    let subtotal = 0;
    for (const item of cart.items) {
      const price = item.productVariant ? Number(item.productVariant.price) : Number(item.product.price);
      const stock = item.productVariant ? item.productVariant.stock : item.product.stock;
      if (item.quantity > stock) throw new Error(`Stock insuficiente para ${item.product.name}`);
      subtotal += price * item.quantity;
    }

    let discount = 0;
    let couponId: number | null = null;
    if (couponCode) {
      const couponResult = await CouponService.validate(couponCode, subtotal);
      discount = couponResult.discount;
      couponId = couponResult.coupon.id;
    }

    const total = Math.round((subtotal + shippingCost - discount) * 100) / 100;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal,
          shippingCost,
          discount,
          total,
          couponId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          orderItems: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              price: item.productVariant ? item.productVariant.price : item.product.price,
            })),
          },
        },
      });

      for (const item of cart.items) {
        if (item.productVariantId) {
          await tx.productVariant.update({ where: { id: item.productVariantId }, data: { stock: { decrement: item.quantity } } });
        } else {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (couponId) await CouponService.incrementUsage(couponId);

      return newOrder;
    });

    await ShipmentService.createForOrder(order.id);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user) {
      const email = orderConfirmationEmail({ orderId: order.id, total: total.toFixed(2), itemCount: cart.items.length });
      sendEmail(user.email, email.subject, email.html);
    }

    await NotificationService.create(userId, 'ORDER_UPDATE', `Pedido #${order.id} creado`, `Tu pedido por $${total.toFixed(2)} ha sido recibido.`, { orderId: order.id });

    return order;
  },

  async getMyOrders(userId: number, pagination: PaginationResult) {
    const where = { userId };
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: { include: { product: { select: { name: true, images: { take: 1 } } }, productVariant: true } },
          address: true,
          shipments: { select: { id: true, status: true, trackingNumber: true, carrier: true } },
          coupon: { select: { code: true, type: true, value: true } },
        },
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },

  async getOrderById(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true, productVariant: true } },
        address: true,
        shipments: { include: { events: { orderBy: { occurredAt: 'desc' } } } },
        coupon: true,
      },
    });
    if (!order || order.userId !== userId) return null;
    return order;
  },

  async markAsPaid(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) throw new Error('Orden no encontrada');
    if (order.status !== 'PENDING') throw new Error('La orden ya fue procesada');
    return await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paymentStatus: 'COMPLETED' },
    });
  },

  async getAllOrdersAdmin(pagination: PaginationResult) {
    const where = {};
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          orderItems: { include: { product: { select: { name: true } }, productVariant: true } },
          address: true,
          shipments: { select: { id: true, status: true, trackingNumber: true, carrier: true } },
          coupon: { select: { code: true } },
        },
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },

  async updateOrderStatusAdmin(orderId: number, status: OrderStatusType) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: { select: { name: true, email: true } }, orderItems: true },
    });
  },

  async getOrdersForExport(limit: number = 5000) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: { select: { name: true } } } },
        address: true,
      },
    });
  },
};
