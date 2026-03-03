import { createReviewSchema } from '../../validation/reviewSchema';

describe('reviewSchema', () => {
  describe('createReviewSchema', () => {
    it('accepts valid review', () => {
      expect(() => createReviewSchema.parse({ productId: 1, rating: 5 })).not.toThrow();
      expect(() => createReviewSchema.parse({ productId: 10, rating: 3, comment: 'Good product' })).not.toThrow();
    });

    it('rejects invalid productId', () => {
      expect(() => createReviewSchema.parse({ productId: 0, rating: 5 })).toThrow();
      expect(() => createReviewSchema.parse({ productId: -1, rating: 5 })).toThrow();
    });

    it('rejects rating out of range', () => {
      expect(() => createReviewSchema.parse({ productId: 1, rating: 0 })).toThrow();
      expect(() => createReviewSchema.parse({ productId: 1, rating: 6 })).toThrow();
    });

    it('accepts rating 1 to 5', () => {
      for (let r = 1; r <= 5; r++) {
        expect(() => createReviewSchema.parse({ productId: 1, rating: r })).not.toThrow();
      }
    });
  });
});
