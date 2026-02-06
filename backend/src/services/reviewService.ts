import { prisma } from '../lib/prisma';

export const ReviewService = {

//   // Crear Reseña
//   async create(userId: number, data: any) {
//     const { productId, rating, comment } = data;

//     // 1. Verificar si el producto existe
//     const product = await prisma.product.findUnique({ where: { id: productId } });
//     if (!product) throw new Error("Producto no encontrado");

//     // 2. Verificar si ya dejó una reseña para este producto
//     const existingReview = await prisma.review.findFirst({
//       where: { userId, productId }
//     });

//     if (existingReview) {
//       throw new Error("Ya has calificado este producto anteriormente.");
//     }

//     // 3. (Opcional Profesional) Verificar si el usuario compró el producto
//     // Esto es común en Amazon ("Compra Verificada"), pero por ahora lo dejaremos abierto.

//     return await prisma.review.create({
//       data: {
//         userId,
//         productId,
//         rating,
//         comment
//       }
//     });
//   },



// Crear Reseña (Solo si hubo compra verificada)
  async create(userId: number, data: any) {
    const { productId, rating, comment } = data;

    // 1. Verificar si el producto existe
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Producto no encontrado");

    // 2. VERIFICACIÓN DE COMPRA (Lógica Profesional)
    // Buscamos si existe al menos una orden de este usuario que incluya este producto
    // y que NO esté en estado PENDING o CANCELLED.
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: userId,
        // El estado debe indicar que la compra es real
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'PROCESSING'] },
        orderItems: {
          some: {
            productId: productId
          }
        }
      }
    });

    if (!hasPurchased) {
      throw new Error("Solo puedes valorar productos que has comprado y pagado.");
    }

    // 3. Verificar si ya dejó una reseña (Para evitar duplicados)
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      throw new Error("Ya has calificado este producto anteriormente.");
    }

    // 4. Crear la reseña
    return await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      }
    });
  },



  // Obtener reseñas de un producto
  async getByProduct(productId: number) {
    return await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true, profileImage: true } } // Solo mostramos nombre y foto
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Eliminar reseña (Usuario dueño o Admin)
  async delete(userId: number, userRole: string, reviewId: number) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    
    if (!review) throw new Error("Reseña no encontrada");

    // Solo puede borrar si es ADMIN o es el DUEÑO de la reseña
    if (userRole !== 'ADMIN' && review.userId !== userId) {
      throw new Error("No tienes permiso para eliminar esta reseña");
    }

    return await prisma.review.delete({
      where: { id: reviewId }
    });
  }
};