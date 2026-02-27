import { prisma } from '../lib/prisma';

export const AnalyticsService = {
  async getSalesAnalytics(period: string = '30d') {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '365d' ? 365 : 30;
    const since = new Date(Date.now() - days * 86400000);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
      select: { total: true, createdAt: true, status: true, currency: true },
    });

    const dailySales: Record<string, { revenue: number; orders: number }> = {};
    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!dailySales[day]) dailySales[day] = { revenue: 0, orders: 0 };
      dailySales[day].revenue += Number(o.total);
      dailySales[day].orders++;
    }

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const paidOrders = orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED').length;
    const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

    return {
      totalRevenue, totalOrders, avgOrderValue, conversionRate,
      dailySales: Object.entries(dailySales).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date)),
    };
  },

  async getProductAnalytics(limit = 20) {
    const products = await prisma.product.findMany({
      include: {
        orderItems: { select: { quantity: true, price: true } },
        reviews: { select: { rating: true } },
        _count: { select: { orderItems: true, reviews: true, wishlistItems: true } },
      },
      take: limit,
      orderBy: { orderItems: { _count: 'desc' } },
    });

    return products.map(p => ({
      id: p.id, name: p.name, slug: p.slug, price: Number(p.price),
      unitsSold: p.orderItems.reduce((s, i) => s + i.quantity, 0),
      revenue: p.orderItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
      avgRating: p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0,
      reviewCount: p._count.reviews,
      wishlistCount: p._count.wishlistItems,
    }));
  },

  async getUserAnalytics() {
    const [total, active, newThisMonth, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.user.groupBy({ by: ['role'], _count: true }),
    ]);
    return { total, active, newThisMonth, byRole };
  },

  async getVendorAnalytics(vendorId: number) {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new Error('VENDOR_NOT_FOUND');

    const products = await prisma.product.findMany({
      where: { vendorId },
      include: {
        orderItems: { select: { quantity: true, price: true } },
        _count: { select: { orderItems: true, reviews: true } },
      },
    });

    const totalRevenue = products.reduce((s, p) => s + p.orderItems.reduce((ss, i) => ss + Number(i.price) * i.quantity, 0), 0);
    const totalSold = products.reduce((s, p) => s + p.orderItems.reduce((ss, i) => ss + i.quantity, 0), 0);

    return {
      vendorName: vendor.businessName,
      totalProducts: products.length,
      totalRevenue, totalSold,
      topProducts: products.sort((a, b) => b._count.orderItems - a._count.orderItems).slice(0, 10).map(p => ({
        id: p.id, name: p.name, sold: p._count.orderItems, reviews: p._count.reviews,
      })),
    };
  },

  async exportSalesReport(period: string, format: string = 'json') {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 86400000);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      include: { user: { select: { name: true, email: true } }, orderItems: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const header = 'Order ID,Date,Customer,Email,Items,Total,Status,Payment';
      const rows = orders.map(o => `${o.id},${o.createdAt.toISOString()},${o.user.name},${o.user.email},${o.orderItems.length},${o.total},${o.status},${o.paymentStatus}`);
      return header + '\n' + rows.join('\n');
    }
    return orders;
  },
};
