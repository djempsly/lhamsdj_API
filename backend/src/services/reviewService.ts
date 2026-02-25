import { prisma } from '../lib/prisma';
import { PaginationResult, buildPaginatedResponse } from '../utils/pagination';

export const ReviewService = {
  async create(userId: number, data: any) {
    const { productId, rating, comment } = data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Producto no encontrado');

    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'PROCESSING'] },
        orderItems: { some: { productId } },
      },
    });
    if (!hasPurchased) throw new Error('Solo puedes valorar productos que has comprado y pagado.');

    const existingReview = await prisma.review.findFirst({ where: { userId, productId } });
    if (existingReview) throw new Error('Ya has calificado este producto anteriormente.');

    return await prisma.review.create({ data: { userId, productId, rating, comment } });
  },

  async getByProduct(productId: number, pagination: PaginationResult) {
    const where = { productId };
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: { name: true, profileImage: true } } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.review.count({ where }),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },

  async delete(userId: number, userRole: string, reviewId: number) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error('Reseña no encontrada');
    if (userRole !== 'ADMIN' && review.userId !== userId) throw new Error('No tienes permiso para eliminar esta reseña');
    return await prisma.review.delete({ where: { id: reviewId } });
  },
};
