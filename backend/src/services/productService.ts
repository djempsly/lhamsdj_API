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
    const { images, tags, ...updateData } = data;

    // Track price history
    if (updateData.price !== undefined) {
      const current = await prisma.product.findUnique({ where: { id }, select: { price: true } });
      if (current && Number(current.price) !== Number(updateData.price)) {
        await prisma.priceHistory.create({
          data: { productId: id, oldPrice: current.price, newPrice: updateData.price },
        });
      }
    }

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

  async duplicate(id: number) {
    const original = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, tags: { include: { tag: true } } },
    });
    if (!original) throw new Error('Product not found');

    const slug = generateSlug(original.name + ' Copy');

    const createData: any = {
      name: `${original.name} (Copy)`,
      description: original.description,
      price: original.price,
      stock: original.stock,
      slug,
      isActive: false,
      weight: original.weight,
      categoryId: original.categoryId,
      vendorId: original.vendorId,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
    };

    if (original.images.length > 0) {
      createData.images = { create: original.images.map(img => ({ url: img.url, position: img.position })) };
    }
    if (original.variants.length > 0) {
      createData.variants = {
        create: original.variants.map(v => ({
          size: v.size,
          color: v.color,
          sku: `${v.sku}-COPY-${Date.now().toString().slice(-4)}`,
          stock: v.stock,
          price: v.price,
        })),
      };
    }
    if (original.tags.length > 0) {
      createData.tags = { create: original.tags.map(pt => ({ tagId: pt.tagId })) };
    }

    return await prisma.product.create({
      data: createData,
      include: { images: true, variants: true, category: true },
    });
  },

  async bulkAction(ids: number[], action: string, params: any = {}) {
    switch (action) {
      case 'delete':
        return await prisma.product.deleteMany({ where: { id: { in: ids } } });
      case 'activate':
        return await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
      case 'deactivate':
        return await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
      case 'category':
        if (!params.categoryId) throw new Error('categoryId required');
        return await prisma.product.updateMany({ where: { id: { in: ids } }, data: { categoryId: params.categoryId } });
      case 'price':
        const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, price: true } });
        const updates = products.map(p => {
          const oldPrice = Number(p.price);
          const newPrice = params.type === 'percentage'
            ? oldPrice * (1 + params.value / 100)
            : oldPrice + params.value;
          return prisma.$transaction([
            prisma.priceHistory.create({ data: { productId: p.id, oldPrice: p.price, newPrice: Math.max(0, newPrice) } }),
            prisma.product.update({ where: { id: p.id }, data: { price: Math.max(0, newPrice) } }),
          ]);
        });
        await Promise.all(updates);
        return { count: products.length };
      default:
        throw new Error('Invalid action');
    }
  },

  async getLowStock(threshold: number = 5) {
    return await prisma.product.findMany({
      where: { stock: { lt: threshold }, isActive: true },
      include: {
        images: { take: 1 },
        category: { select: { name: true } },
      },
      orderBy: { stock: 'asc' },
      take: 50,
    });
  },

  async getAnalytics(productId: number) {
    const [viewCount, orderData, reviewData] = await Promise.all([
      prisma.recentlyViewed.count({ where: { productId } }),
      prisma.orderItem.aggregate({
        where: { productId },
        _sum: { quantity: true },
        _count: true,
      }),
      prisma.review.aggregate({
        where: { productId, status: 'APPROVED' },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    // Revenue: sum of (price * quantity) from order items
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      select: { price: true, quantity: true },
    });
    const revenue = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const views = viewCount || 1;
    const unitsSold = orderData._sum.quantity || 0;

    return {
      views: viewCount,
      revenue: Math.round(revenue * 100) / 100,
      unitsSold,
      conversionRate: Math.round((orderData._count / views) * 10000) / 100,
      avgRating: Math.round((reviewData._avg.rating || 0) * 10) / 10,
      reviewCount: reviewData._count,
    };
  },

  async getPriceHistory(productId: number) {
    return await prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { changedAt: 'desc' },
      take: 50,
    });
  },

  async reorderImages(productId: number, imageIds: number[]) {
    const updates = imageIds.map((id, index) =>
      prisma.productImage.update({ where: { id }, data: { position: index } })
    );
    await prisma.$transaction(updates);
  },

  async exportCsv() {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { variants: true, images: true } },
      },
      orderBy: { id: 'asc' },
    });

    const header = 'id,name,slug,price,stock,category,isActive,weight,variants,images,metaTitle,metaDescription';
    const rows = products.map(p =>
      [p.id, `"${(p.name || '').replace(/"/g, '""')}"`, p.slug, p.price, p.stock, `"${p.category?.name || ''}"`, p.isActive, p.weight || '', p._count.variants, p._count.images, `"${(p.metaTitle || '').replace(/"/g, '""')}"`, `"${(p.metaDescription || '').replace(/"/g, '""')}"`].join(',')
    );
    return [header, ...rows].join('\n');
  },
};
