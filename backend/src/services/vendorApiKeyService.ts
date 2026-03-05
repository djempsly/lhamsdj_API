import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const SCOPES = ['products:read', 'products:write', 'orders:read', 'orders:write', 'analytics:read'] as const;
export type VendorApiKeyScope = (typeof SCOPES)[number];
export const VALID_SCOPES = SCOPES;

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export const VendorApiKeyService = {
  async create(vendorId: number, name: string, scopes: string[]) {
    const invalid = scopes.filter((s) => !SCOPES.includes(s as VendorApiKeyScope));
    if (invalid.length) throw new Error('Scopes inválidos: ' + invalid.join(', '));
    const rawKey = `lhams_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = hashKey(rawKey);
    await prisma.vendorApiKey.create({
      data: { vendorId, name, keyHash, scopes: scopes.join(',') },
    });
    return { key: rawKey, name, scopes };
  },

  async validateAndGetVendor(key: string, requiredScope?: string): Promise<number | null> {
    const keyHash = hashKey(key);
    const row = await prisma.vendorApiKey.findFirst({
      where: { keyHash },
      select: { vendorId: true, scopes: true },
    });
    if (!row) return null;
    const scopes = row.scopes.split(',').map((s) => s.trim());
    if (requiredScope && !scopes.includes(requiredScope)) return null;
    await prisma.vendorApiKey.updateMany({
      where: { keyHash },
      data: { lastUsedAt: new Date() },
    });
    return row.vendorId;
  },

  async list(vendorId: number) {
    return prisma.vendorApiKey.findMany({
      where: { vendorId },
      select: { id: true, name: true, scopes: true, lastUsedAt: true, createdAt: true },
    });
  },

  async revoke(vendorId: number, id: number) {
    await prisma.vendorApiKey.deleteMany({ where: { id, vendorId } });
  },
};
