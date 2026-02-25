import { prisma } from '../lib/prisma';
import { PaginationResult, buildPaginatedResponse } from '../utils/pagination';

const generateSlug = (text: string) => {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
    + '-' + Date.now().toString().slice(-4);
};

export const VendorService = {
  async register(userId: number, data: any) {
    const existingVendor = await prisma.vendor.findUnique({ where: { userId } });
    if (existingVendor) throw new Error('Ya tienes una cuenta de vendedor');

    const slug = generateSlug(data.businessName);

    const vendor = await prisma.$transaction(async (tx) => {
      const v = await tx.vendor.create({
        data: { ...data, userId, slug, status: 'PENDING' },
      });
      await tx.user.update({ where: { id: userId }, data: { role: 'VENDOR' } });
      return v;
    });

    return vendor;
  },

  async getMyVendorProfile(userId: number) {
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: { _count: { select: { products: true, shipments: true, payouts: true } } },
    });
    if (!vendor) throw new Error('No tienes cuenta de vendedor');
    return vendor;
  },

  async updateProfile(userId: number, data: any) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new Error('No tienes cuenta de vendedor');
    return await prisma.vendor.update({ where: { id: vendor.id }, data });
  },

  async getPublicProfile(slug: string) {
    return await prisma.vendor.findUnique({
      where: { slug },
      select: {
        id: true, businessName: true, slug: true, description: true, logo: true,
        country: true, city: true, type: true, createdAt: true,
        _count: { select: { products: true } },
      },
    });
  },

  async getVendorProducts(vendorId: number, pagination: PaginationResult) {
    const where = { vendorId, isActive: true };
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { images: { take: 2 }, category: { select: { name: true } } },
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.product.count({ where }),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },

  async adminGetAll(pagination: PaginationResult, status?: string | undefined) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: { user: { select: { name: true, email: true } }, _count: { select: { products: true } } },
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.vendor.count({ where }),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },

  async adminUpdate(vendorId: number, data: { status?: string | undefined; commissionRate?: number | undefined }) {
    return await prisma.vendor.update({ where: { id: vendorId }, data: data as any });
  },

  async getVendorDashboard(userId: number) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new Error('No tienes cuenta de vendedor');

    const [productCount, totalSales, pendingShipments, totalPayouts] = await Promise.all([
      prisma.product.count({ where: { vendorId: vendor.id } }),
      prisma.orderItem.aggregate({
        where: { product: { vendorId: vendor.id }, order: { paymentStatus: 'COMPLETED' } },
        _sum: { price: true },
        _count: true,
      }),
      prisma.shipment.count({ where: { vendorId: vendor.id, status: 'PENDING' } }),
      prisma.vendorPayout.aggregate({
        where: { vendorId: vendor.id, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      products: productCount,
      totalRevenue: totalSales._sum.price || 0,
      totalOrders: totalSales._count,
      pendingShipments,
      totalPaidOut: totalPayouts._sum.amount || 0,
    };
  },
};
