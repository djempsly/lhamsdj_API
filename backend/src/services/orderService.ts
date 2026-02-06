import { prisma } from '../lib/prisma';

export const OrderService = {

  // =================================================================
  // CREAR ORDEN (CHECKOUT) - TRANSACCIÓN COMPLETA
  // =================================================================
  async createOrder(userId: number, addressId: number) {
    // 1. Obtener el carrito con sus items y detalles de producto/variante
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { 
        items: { 
          include: { 
            product: true, 
            productVariant: true 
          } 
        } 
      }
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("El carrito está vacío.");
    }

    // 2. Verificar que la dirección existe y pertenece al usuario
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!address) {
      throw new Error("Dirección no válida o no pertenece al usuario.");
    }

    // 3. CÁLCULO DE TOTAL Y VALIDACIÓN DE STOCK (Antes de tocar la BD)
    let total = 0;
    
    for (const item of cart.items) {
      // Precio: Prioridad a la variante, si no existe, usa el del producto
      const price = item.productVariant ? Number(item.productVariant.price) : Number(item.product.price);
      
      // Lógica de Validación de Stock
      if (item.productVariant) {
        // CASO A: Es una Variante (Ej: Camiseta Talla L)
        if (item.quantity > item.productVariant.stock) {
          throw new Error(`Stock insuficiente para ${item.product.name} (Variante: ${item.productVariant.sku})`);
        }
      } else {
        // CASO B: Es un Producto Simple (Ej: Taza) - Usamos el campo stock de Product
        if (item.quantity > item.product.stock) {
          throw new Error(`Stock insuficiente para ${item.product.name}`);
        }
      }

      total += price * item.quantity;
    }

    // 4. TRANSACCIÓN ATÓMICA (Todo o nada)
    return await prisma.$transaction(async (tx) => {
      
      // A) Crear la Orden
      const order = await tx.order.create({
        data: {
          userId,
          addressId,
          total: total,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          orderItems: {
            create: cart.items.map(item => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              price: item.productVariant ? item.productVariant.price : item.product.price
            }))
          }
        }
      });

      // B) Restar Stock (Actualización de inventario)
      for (const item of cart.items) {
        if (item.productVariantId) {
          // Descontar de la tabla Variantes
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { decrement: item.quantity } }
          });
        } else {
          // Descontar de la tabla Productos (Nuevo campo stock)
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // C) Vaciar el Carrito del usuario
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return order;
    });
  },

  // =================================================================
  // OBTENER MIS ÓRDENES (HISTORIAL)
  // =================================================================
  async getMyOrders(userId: number) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { 
            product: { 
              select: { name: true, images: { take: 1 } } 
            },
            productVariant: true
          }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // =================================================================
  // OBTENER DETALLE DE UNA ORDEN
  // =================================================================
  async getOrderById(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { 
            product: true, 
            productVariant: true 
          }
        },
        address: true
      }
    });

    // Seguridad: Verificar que la orden sea del usuario que la pide
    if (!order || order.userId !== userId) {
      return null;
    }
    
    return order;
  },


  // Simular Pago (Para desarrollo)
  async markAsPaid(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.userId !== userId) throw new Error("Orden no encontrada");
    if (order.status !== 'PENDING') throw new Error("La orden ya fue procesada");

    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'COMPLETED'
      }
    });
  }
};
  




