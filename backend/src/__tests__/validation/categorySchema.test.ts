import { createCategorySchema, updateCategorySchema } from '../../validation/categorySchema';

describe('categorySchema', () => {
  describe('createCategorySchema', () => {
    it('accepts valid category', () => {
      expect(() => createCategorySchema.parse({ name: 'Electronics' })).not.toThrow();
      expect(() => createCategorySchema.parse({
        name: 'Fashion',
        description: 'Clothing and accessories',
        parentId: 1,
        image: 'https://example.com/img.jpg',
      })).not.toThrow();
    });

    it('rejects short name', () => {
      expect(() => createCategorySchema.parse({ name: 'AB' })).toThrow();
    });

    it('rejects invalid image URL', () => {
      expect(() => createCategorySchema.parse({ name: 'Cat', image: 'not-a-url' })).toThrow();
    });
  });

  describe('updateCategorySchema', () => {
    it('accepts partial updates', () => {
      expect(() => updateCategorySchema.parse({})).not.toThrow();
      expect(() => updateCategorySchema.parse({ name: 'New Name' })).not.toThrow();
      expect(() => updateCategorySchema.parse({ parentId: 2, image: 'https://x.com/i.png' })).not.toThrow();
    });

    it('rejects name too short when provided', () => {
      expect(() => updateCategorySchema.parse({ name: 'x' })).toThrow();
    });
  });
});
