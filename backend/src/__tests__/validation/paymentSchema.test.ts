import { createPaymentIntentSchema } from '../../validation/paymentSchema';

describe('paymentSchema', () => {
  describe('createPaymentIntentSchema', () => {
    it('accepts valid orderId', () => {
      expect(() => createPaymentIntentSchema.parse({ orderId: 1 })).not.toThrow();
    });
    it('rejects missing orderId', () => {
      expect(() => createPaymentIntentSchema.parse({})).toThrow();
    });
    it('rejects invalid orderId', () => {
      expect(() => createPaymentIntentSchema.parse({ orderId: 0 })).toThrow();
      expect(() => createPaymentIntentSchema.parse({ orderId: -1 })).toThrow();
    });
  });
});
