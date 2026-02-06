import { prisma } from '../lib/prisma';

export const CartService = {

//   // Obtener el carrito del usuario (o crearlo si no existe)
//   async getCart(userId: number) {
//     let cart = await prisma.cart.findUnique({
//       where: { userId },
//       include: {
//         items: {
//           include: {
//             product: {
//               select: { id: true, name: true, price: true, images: { take: 1 } }
//             },
//             productVariant: true
//           },
//           orderBy: { id: 'asc' }
//         }
//       }
//     });

//     // Si no tiene carrito, se lo creamos al momento (Lazy creation)
//     if (!cart) {
//       cart = await prisma.cart.create({
//         data: { userId },
//         include: { items: { include: { product: true, productVariant: true } } }
//       });
//     }

//     return cart;
//   },




async getCart(userId: number) {
  // 1. Buscamos el carrito existente
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            // Aquí seleccionamos campos específicos + imágenes
            select: { 
              id: true, 
              name: true, 
              price: true, 
              images: { take: 1 } 
            }
          },
          productVariant: true
        },
        orderBy: { id: 'asc' }
      }
    }
  });

  // 2. Si no existe, lo creamos
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      // CORRECCIÓN AQUÍ 👇:
      // Usamos exactamente la misma estructura de 'include' que arriba.
      // Antes tenías 'product: true', lo cual no traía 'images'.
      include: {
        items: {
          include: {
            product: {
              select: { 
                id: true, 
                name: true, 
                price: true, 
                images: { take: 1 } 
              }
            },
            productVariant: true
          },
          // orderBy no es necesario en create (está vacío), pero no estorba
        }
      }
    });
  }

  return cart;
},





  // Agregar item al carrito
  async addToCart(userId: number, data: any) {
    const { productId, quantity, productVariantId } = data;

    // 1. Aseguramos que el usuario tenga carrito
    const cart = await this.getCart(userId);

    // 2. Verificamos si el producto existe y está activo
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new Error("Producto no disponible");

    // 3. Buscamos si ya existe ese item en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        productVariantId: productVariantId || null // Manejo de nulos para variantes
      }
    });

    if (existingItem) {
      // SI YA EXISTE: Sumamos la cantidad
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // SI NO EXISTE: Creamos el item
      return await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          productVariantId
        }
      });
    }
  },

  // Actualizar cantidad de un item
  async updateItemQuantity(userId: number, itemId: number, quantity: number) {
    // Verificamos que el item pertenezca al carrito del usuario (Seguridad)
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item || item.cart.userId !== userId) {
      throw new Error("Item no encontrado o no pertenece al usuario");
    }

    return await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });
  },

  // Eliminar un item
  async removeItem(userId: number, itemId: number) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item || item.cart.userId !== userId) {
      throw new Error("Item no encontrado");
    }

    return await prisma.cartItem.delete({
      where: { id: itemId }
    });
  },

  // Vaciar carrito
  async clearCart(userId: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    return await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  }
};