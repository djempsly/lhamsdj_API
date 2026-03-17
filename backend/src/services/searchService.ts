import { prisma } from '../lib/prisma';

export const SearchService = {
  async advancedSearch(params: {
    q?: string; categoryId?: number; minPrice?: number; maxPrice?: number;
    minRating?: number; vendorId?: number; inStock?: boolean;
    color?: string; size?: string;
    sort?: string; page?: number; limit?: number;
  }) {
    const { q, categoryId, minPrice, maxPrice, minRating, vendorId, inStock, color, size, sort = 'newest', page = 1, limit = 20 } = params;
    const where: any = { isActive: true };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (vendorId) where.vendorId = vendorId;
    if (inStock) where.stock = { gt: 0 };

    // Variant-based filtering (color/size)
    if (color || size) {
      const variantFilter: any = {};
      if (color) {
        const colors = color.split(',').map(c => c.trim());
        variantFilter.color = { in: colors, mode: 'insensitive' };
      }
      if (size) {
        const sizes = size.split(',').map(s => s.trim());
        variantFilter.size = { in: sizes, mode: 'insensitive' };
      }
      where.variants = { some: variantFilter };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'best_selling') orderBy = { orderItems: { _count: 'desc' } };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: true,
          category: true,
          variants: { select: { id: true, color: true, size: true, stock: true, price: true } },
          vendor: { select: { id: true, businessName: true, slug: true } },
          reviews: { select: { rating: true } },
          _count: { select: { orderItems: true, reviews: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const enriched = products.map(p => ({
      ...p,
      avgRating: p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0,
      reviewCount: p._count.reviews,
      soldCount: p._count.orderItems,
    }));

    const filtered = minRating ? enriched.filter(p => p.avgRating >= minRating) : enriched;

    const priceRange = await prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    });

    const categories = await prisma.category.findMany({
      where: { products: { some: { isActive: true } } },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
    });

    return {
      data: filtered,
      total: minRating ? filtered.length : total,
      page,
      totalPages: Math.ceil((minRating ? filtered.length : total) / limit),
      facets: {
        priceRange: { min: Number(priceRange._min.price) || 0, max: Number(priceRange._max.price) || 0 },
        categories,
      },
    };
  },

  async getRecommendations(productId: number, limit = 8) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, price: true, vendorId: true },
    });
    if (!product) return [];

    const priceRange = Number(product.price) * 0.5;
    return prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        OR: [
          { categoryId: product.categoryId },
          { price: { gte: Number(product.price) - priceRange, lte: Number(product.price) + priceRange } },
        ],
      },
      include: { images: true, reviews: { select: { rating: true } } },
      take: limit,
      orderBy: { orderItems: { _count: 'desc' } },
    });
  },

  async trackView(userId: number, productId: number) {
    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: { viewedAt: new Date() },
    });
  },

  async getRecentlyViewed(userId: number, limit = 12) {
    const items = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
      orderBy: { viewedAt: 'desc' },
      take: limit,
    });
    return items.map(i => i.product);
  },

  async getFilters(params: { categoryId?: number; q?: string }) {
    const { categoryId, q } = params;
    const productWhere: any = { isActive: true };
    if (categoryId) productWhere.categoryId = categoryId;
    if (q) {
      productWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [priceRange, categories, vendors, variants] = await Promise.all([
      prisma.product.aggregate({
        where: productWhere,
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.category.findMany({
        where: { products: { some: productWhere } },
        select: { id: true, name: true, slug: true, parentId: true, _count: { select: { products: { where: productWhere } } } },
        orderBy: { name: 'asc' },
      }),
      prisma.vendor.findMany({
        where: { status: 'ACTIVE', products: { some: productWhere } },
        select: { id: true, businessName: true, slug: true, _count: { select: { products: { where: productWhere } } } },
        orderBy: { businessName: 'asc' },
      }),
      prisma.productVariant.findMany({
        where: { product: productWhere },
        select: { color: true, size: true },
      }),
    ]);

    const colorsSet = new Set<string>();
    const sizesSet = new Set<string>();
    for (const v of variants) {
      if (v.color) colorsSet.add(v.color);
      if (v.size) sizesSet.add(v.size);
    }

    return {
      priceRange: { min: Number(priceRange._min.price) || 0, max: Number(priceRange._max.price) || 0 },
      categories,
      vendors,
      colors: Array.from(colorsSet).sort(),
      sizes: Array.from(sizesSet).sort(),
    };
  },

  async getAutoComplete(q: string, limit = 10) {
    if (!q || q.length < 2) return [];
    const products = await prisma.product.findMany({
      where: { isActive: true, name: { contains: q, mode: 'insensitive' } },
      select: { id: true, name: true, slug: true, price: true, images: { take: 1, select: { url: true } } },
      take: limit,
    });
    const categories = await prisma.category.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      select: { id: true, name: true, slug: true },
      take: 5,
    });
    return { products, categories };
  },
};
