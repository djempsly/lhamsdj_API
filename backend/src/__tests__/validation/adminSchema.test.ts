import {
  adminUpdateOrderStatusSchema,
  adminExportQuerySchema,
  auditLogQuerySchema,
  vendorStatusSchema,
} from '../../validation/adminSchema';

describe('adminSchema', () => {
  describe('adminUpdateOrderStatusSchema', () => {
    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

    validStatuses.forEach((status) => {
      it(`accepts status ${status}`, () => {
        expect(() => adminUpdateOrderStatusSchema.parse({ status })).not.toThrow();
      });
    });

    it('rejects invalid status', () => {
      expect(() => adminUpdateOrderStatusSchema.parse({ status: 'INVALID' })).toThrow();
    });
  });

  describe('adminExportQuerySchema', () => {
    it('accepts default (csv, 5000)', () => {
      const result = adminExportQuerySchema.parse({});
      expect(result.format).toBe('csv');
      expect(result.limit).toBe(5000);
    });

    it('accepts format and limit', () => {
      expect(() => adminExportQuerySchema.parse({ format: 'csv', limit: 1000 })).not.toThrow();
    });

    it('rejects limit out of range', () => {
      expect(() => adminExportQuerySchema.parse({ limit: 0 })).toThrow();
      expect(() => adminExportQuerySchema.parse({ limit: 15000 })).toThrow();
    });
  });

  describe('auditLogQuerySchema', () => {
    it('accepts optional filters', () => {
      expect(() => auditLogQuerySchema.parse({})).not.toThrow();
      expect(() => auditLogQuerySchema.parse({ action: 'LOGIN', entity: 'User', userId: 1 })).not.toThrow();
    });
  });

  describe('vendorStatusSchema', () => {
    it('accepts valid vendor statuses', () => {
      ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].forEach((status) => {
        expect(() => vendorStatusSchema.parse({ status })).not.toThrow();
      });
    });

    it('rejects invalid status', () => {
      expect(() => vendorStatusSchema.parse({ status: 'UNKNOWN' })).toThrow();
    });
  });
});
