import { createProductSchema, updateProductSchema } from '../../validation/productSchema';

describe('productSchema', () => {
  describe('createProductSchema', () => {
    it('accepts valid product', () => {
      expect(() => createProductSchema.parse({ name: 'Test Product', price: 29.99, categoryId: 1 })).not.toThrow();
    });
    it('rejects short name', () => {
      expect(() => createProductSchema.parse({ name: 'AB', price: 10, categoryId: 1 })).toThrow();
    });
    it('rejects negative price', () => {
      expect(() => createProductSchema.parse({ name: 'X', price: -1, categoryId: 1 })).toThrow();
    });
    it('rejects invalid categoryId', () => {
      expect(() => createProductSchema.parse({ name: 'X', price: 10, categoryId: 0 })).toThrow();
    });
  });

  describe('updateProductSchema', () => {
    it('accepts partial updates', () => {
      expect(() => updateProductSchema.parse({})).not.toThrow();
    });
    it('rejects negative price when provided', () => {
      expect(() => updateProductSchema.parse({ price: -5 })).toThrow();
    });
  });
});
