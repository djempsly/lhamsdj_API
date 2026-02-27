import { prisma } from '../lib/prisma';

export const BundleService = {
  async getAll() {
    return prisma.bundle.findMany({
      where: { isActive: true },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
  },

  async getBySlug(slug: string) {
    return prisma.bundle.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                reviews: { select: { rating: true } },
              },
            },
          },
        },
      },
    });
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    discount: number;
    items: { productId: number; quantity: number }[];
  }) {
    return prisma.bundle.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        price: data.price,
        discount: data.discount,
        items: { create: data.items },
      },
      include: { items: true },
    });
  },

  async update(id: number, data: Record<string, unknown>) {
    return prisma.bundle.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.bundle.delete({ where: { id } });
  },
};
