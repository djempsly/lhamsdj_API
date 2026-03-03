import { updateProfileSchema, toggleUserStatusSchema, userIdParamSchema } from '../../validation/userSchema';

describe('userSchema', () => {
  describe('updateProfileSchema', () => {
    it('accepts empty or partial updates', () => {
      expect(() => updateProfileSchema.parse({})).not.toThrow();
      expect(() => updateProfileSchema.parse({ name: 'New Name' })).not.toThrow();
      expect(() => updateProfileSchema.parse({
        name: 'Jane Doe',
        email: 'a@b.com',
        phone: '+1234567890',
        profileImage: 'https://x.com/img.png',
        password: 'NewPass1!',
      })).not.toThrow();
    });

    it('rejects invalid email when provided', () => {
      expect(() => updateProfileSchema.parse({ email: 'bad' })).toThrow();
    });

    it('rejects short name when provided', () => {
      expect(() => updateProfileSchema.parse({ name: 'x' })).toThrow();
    });

    it('rejects short password when provided', () => {
      expect(() => updateProfileSchema.parse({ password: 'short' })).toThrow();
    });
  });

  describe('toggleUserStatusSchema', () => {
    it('accepts isActive boolean', () => {
      expect(() => toggleUserStatusSchema.parse({ isActive: true })).not.toThrow();
      expect(() => toggleUserStatusSchema.parse({ isActive: false })).not.toThrow();
    });

    it('rejects missing isActive', () => {
      expect(() => toggleUserStatusSchema.parse({})).toThrow();
    });
  });

  describe('userIdParamSchema', () => {
    it('accepts numeric string id', () => {
      expect(() => userIdParamSchema.parse({ id: '1' })).not.toThrow();
      expect(() => userIdParamSchema.parse({ id: '123' })).not.toThrow();
    });

    it('rejects non-numeric id', () => {
      expect(() => userIdParamSchema.parse({ id: 'abc' })).toThrow();
      expect(() => userIdParamSchema.parse({ id: '1a' })).toThrow();
    });
  });
});
