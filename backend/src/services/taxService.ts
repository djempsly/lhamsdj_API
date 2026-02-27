import { prisma } from '../lib/prisma';

export const TaxService = {
  async calculateTax(country: string, state: string | null, subtotal: number) {
    const where: { country: string; state: string | null; isActive: boolean } = { country, state: state || null, isActive: true };

    let rule = await prisma.taxRule.findFirst({ where });
    if (!rule && state) {
      rule = await prisma.taxRule.findFirst({ where: { country, state: null, isActive: true } });
    }

    if (!rule) return { taxRate: 0, taxAmount: 0, taxName: 'No tax' };
    const taxAmount = subtotal * Number(rule.taxRate);
    return { taxRate: Number(rule.taxRate), taxAmount: Math.round(taxAmount * 100) / 100, taxName: rule.name };
  },

  async getRules() {
    return prisma.taxRule.findMany({ orderBy: [{ country: 'asc' }, { state: 'asc' }] });
  },

  async createRule(data: { country: string; state?: string; taxRate: number; name: string }) {
    return prisma.taxRule.create({ data: { ...data, state: data.state || null } });
  },

  async updateRule(id: number, data: { taxRate?: number; name?: string; isActive?: boolean }) {
    return prisma.taxRule.update({ where: { id }, data });
  },

  async deleteRule(id: number) {
    return prisma.taxRule.delete({ where: { id } });
  },
};
