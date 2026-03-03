import { createVariantSchema, updateVariantSchema } from '../../validation/variantSchema';

describe('variantSchema', () => {
  const validCreate = { productId: 1, sku: 'SKU-001', stock: 10, price: 19.99 };

  describe('createVariantSchema', () => {
    it('accepts valid variant', () => {
      expect(() => createVariantSchema.parse(validCreate)).not.toThrow();
    });
    it('rejects invalid productId', () => {
      expect(() => createVariantSchema.parse({ ...validCreate, productId: 0 })).toThrow();
    });
    it('rejects short sku', () => {
      expect(() => createVariantSchema.parse({ ...validCreate, sku: 'ab' })).toThrow();
    });
    it('rejects negative stock or price', () => {
      expect(() => createVariantSchema.parse({ ...validCreate, stock: -1 })).toThrow();
      expect(() => createVariantSchema.parse({ ...validCreate, price: -1 })).toThrow();
    });
  });

  describe('updateVariantSchema', () => {
    it('accepts partial updates', () => {
      expect(() => updateVariantSchema.parse({})).not.toThrow();
    });
    it('rejects negative stock when provided', () => {
      expect(() => updateVariantSchema.parse({ stock: -1 })).toThrow();
    });
  });
});
