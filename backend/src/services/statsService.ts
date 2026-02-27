import { prisma } from '../lib/prisma';

export const StatsService = {
  async getDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalOrders,
      ordersThisMonth,
      ordersLastMonth,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonthAgg,
      ordersByStatus,
      topProducts,
      recentOrders,
      totalUsers,
      totalVendors,
      totalSuppliers,
      pendingVendors,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.order.aggregate({ where: { paymentStatus: 'COMPLETED' }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, paymentStatus: 'COMPLETED' }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, paymentStatus: 'COMPLETED' }, _sum: { total: true } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true }, _count: true, orderBy: { _sum: { quantity: 'desc' } }, take: 10 }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } }, _count: { select: { orderItems: true } } } }),
      prisma.user.count(),
      prisma.vendor.count({ where: { status: 'ACTIVE' } }),
      prisma.supplier.count({ where: { status: 'ACTIVE' } }),
      prisma.vendor.count({ where: { status: 'PENDING' } }),
    ]);

    const productIds = topProducts.map((p) => p.productId);
    const productNames = productIds.length
      ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } })
      : [];
    const nameMap = Object.fromEntries(productNames.map((p) => [p.id, p.name]));

    const topProductsWithNames = topProducts.map((p) => ({
      productId: p.productId,
      name: nameMap[p.productId] || 'N/A',
      unitsSold: p._sum.quantity || 0,
      orderCount: p._count,
    }));

    const revenueTotal = Number(totalRevenue._sum.total || 0);
    const revenueMonth = Number(revenueThisMonth._sum.total || 0);
    const revenueLastMonth = Number(revenueLastMonthAgg._sum.total || 0);
    const revenueGrowth = revenueLastMonth > 0 ? ((revenueMonth - revenueLastMonth) / revenueLastMonth) * 100 : (revenueMonth > 0 ? 100 : 0);

    return {
      overview: {
        totalOrders,
        ordersThisMonth,
        ordersLastMonth,
        revenueTotal: Math.round(revenueTotal * 100) / 100,
        revenueThisMonth: Math.round(revenueMonth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalUsers,
        activeVendors: totalVendors,
        activeSuppliers: totalSuppliers,
        pendingVendors,
      },
      ordersByStatus: ordersByStatus.reduce<Record<string, number>>((acc, x) => { acc[x.status] = x._count; return acc; }, {}),
      topProducts: topProductsWithNames,
      recentOrders: recentOrders.map((o) => ({ id: o.id, total: Number(o.total), status: o.status, userName: o.user.name, items: o._count.orderItems, createdAt: o.createdAt })),
    };
  },
};
