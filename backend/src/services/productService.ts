import { prisma } from '../lib/prisma';
import { PaginationResult, buildPaginatedResponse } from '../utils/pagination';

const generateSlug = (text: string) => {
  return text
    .toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') + '-' + Date.now().toString().slice(-4);
};

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export const ProductService = {
  async getAll(pagination: PaginationResult, filters: ProductFilters = {}) {
    const where: any = { isActive: true };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }
    if (filters.inStock) where.stock = { gt: 0 };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          images: { take: 2 },
          _count: { select: { reviews: true } },
        },
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, pagination);
  },

  async getBySlug(slug: string) {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        variants: true,
        reviews: { include: { user: { select: { name: true, profileImage: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
  },

  async getById(id: number) {
    return await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });
  },

  async create(data: any) {
    const { images, ...productData } = data;
    const slug = generateSlug(productData.name);

    const categoryExists = await prisma.category.findUnique({ where: { id: productData.categoryId } });
    if (!categoryExists) throw new Error('La categoría especificada no existe');

    return await prisma.product.create({
      data: {
        ...productData,
        slug,
        images: images?.length > 0 ? { create: images.map((url: string) => ({ url })) } : undefined,
      },
      include: { category: true, images: true },
    });
  },

  async update(id: number, data: any) {
    const { images, ...updateData } = data;
    const queryData: any = { ...updateData };

    if (images?.length > 0) {
      queryData.images = { create: images.map((url: string) => ({ url })) };
    }

    return await prisma.product.update({
      where: { id },
      data: queryData,
      include: { images: true },
    });
  },

  async delete(id: number) {
    return await prisma.product.delete({ where: { id } });
  },
};
