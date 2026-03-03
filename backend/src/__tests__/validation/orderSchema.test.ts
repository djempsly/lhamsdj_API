import { createOrderSchema } from '../../validation/orderSchema';

describe('orderSchema', () => {
  describe('createOrderSchema', () => {
    it('accepts valid order data', () => {
      expect(() => createOrderSchema.parse({ addressId: 1 })).not.toThrow();
      expect(() => createOrderSchema.parse({
        addressId: 5,
        shippingCost: 9.99,
        shippingService: 'standard',
        couponCode: 'SAVE10',
      })).not.toThrow();
    });

    it('rejects missing addressId', () => {
      expect(() => createOrderSchema.parse({})).toThrow();
    });

    it('rejects invalid addressId (zero or negative)', () => {
      expect(() => createOrderSchema.parse({ addressId: 0 })).toThrow();
      expect(() => createOrderSchema.parse({ addressId: -1 })).toThrow();
    });

    it('rejects negative shippingCost', () => {
      expect(() => createOrderSchema.parse({ addressId: 1, shippingCost: -5 })).toThrow();
    });
  });
});
