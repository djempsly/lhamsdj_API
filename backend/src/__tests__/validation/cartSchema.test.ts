import { addToCartSchema, updateCartItemSchema } from '../../validation/cartSchema';

describe('cartSchema', () => {
  describe('addToCartSchema', () => {
    it('accepts valid add to cart data', () => {
      expect(() => addToCartSchema.parse({ productId: 1, quantity: 1 })).not.toThrow();
      expect(() => addToCartSchema.parse({ productId: 10, quantity: 5, productVariantId: 2 })).not.toThrow();
    });

    it('rejects invalid productId', () => {
      expect(() => addToCartSchema.parse({ productId: 0, quantity: 1 })).toThrow();
      expect(() => addToCartSchema.parse({ productId: -1, quantity: 1 })).toThrow();
    });

    it('rejects quantity less than 1', () => {
      expect(() => addToCartSchema.parse({ productId: 1, quantity: 0 })).toThrow();
      expect(() => addToCartSchema.parse({ productId: 1, quantity: -1 })).toThrow();
    });
  });

  describe('updateCartItemSchema', () => {
    it('accepts valid quantity', () => {
      expect(() => updateCartItemSchema.parse({ quantity: 1 })).not.toThrow();
      expect(() => updateCartItemSchema.parse({ quantity: 99 })).not.toThrow();
    });

    it('rejects quantity less than 1', () => {
      expect(() => updateCartItemSchema.parse({ quantity: 0 })).toThrow();
    });
  });
});
