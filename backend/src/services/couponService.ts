import { prisma } from '../lib/prisma';

export const CouponService = {
  async create(data: { code: string; type: 'PERCENTAGE' | 'FIXED'; value: number; minPurchase?: number | undefined; maxUses?: number | undefined; expiresAt?: string | undefined }) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existing) throw new Error('El código de cupón ya existe');

    return await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase ?? null,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  },

  async validate(code: string, subtotal: number) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) throw new Error('Cupón no encontrado');
    if (!coupon.isActive) throw new Error('Cupón inactivo');
    if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new Error('Cupón expirado');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new Error('Cupón agotado');
    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      throw new Error(`Compra mínima de $${coupon.minPurchase} requerida`);
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = subtotal * (Number(coupon.value) / 100);
    } else {
      discount = Math.min(Number(coupon.value), subtotal);
    }

    return { coupon, discount: Math.round(discount * 100) / 100 };
  },

  async incrementUsage(couponId: number) {
    await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
  },

  async getAll() {
    return await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async toggleActive(id: number) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error('Cupón no encontrado');
    return await prisma.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
  },

  async delete(id: number) {
    return await prisma.coupon.delete({ where: { id } });
  },
};
