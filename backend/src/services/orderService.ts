import { prisma } from '../lib/prisma';
import { PaginationResult, buildPaginatedResponse } from '../utils/pagination';

export const OrderService = {
  async createOrder(userId: number, addressId: number) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, productVariant: true } } },
    });

    if (!cart || cart.items.length === 0) throw new Error('El carrito está vacío.');

    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new Error('Dirección no válida o no pertenece al usuario.');

    let total = 0;
    for (const item of cart.items) {
      const price = item.productVariant ? Number(item.productVariant.price) : Number(item.product.price);
      if (item.productVariant) {
        if (item.quantity > item.productVariant.stock) throw new Error(`Stock insuficiente para ${item.product.name} (${item.productVariant.sku})`);
      } else {
        if (item.quantity > item.product.stock) throw new Error(`Stock insuficiente para ${item.product.name}`);
      }
      total += price * item.quantity;
    }

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId, addressId, total, status: 'PENDING', paymentStatus: 'PENDING',
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
      return order;
    });
  },

  async getMyOrders(userId: number, pagination: PaginationResult) {
    const where = { userId };
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: { include: { product: { select: { name: true, images: { take: 1 } } }, productVariant: true } },
          address: true,
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
      include: { orderItems: { include: { product: true, productVariant: true } }, address: true },
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
};
