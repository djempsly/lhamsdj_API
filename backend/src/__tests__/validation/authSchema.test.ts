import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../validation/authSchema';

describe('Auth validation schemas', () => {
  describe('registerSchema', () => {
    const valid = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass1!',
      phone: '+1234567890',
      country: 'US',
    };

    it('accepts valid registration data', () => {
      expect(() => registerSchema.parse(valid)).not.toThrow();
    });

    it('rejects short name', () => {
      expect(() => registerSchema.parse({ ...valid, name: 'A' })).toThrow();
    });

    it('rejects invalid email', () => {
      expect(() => registerSchema.parse({ ...valid, email: 'notanemail' })).toThrow();
    });

    it('rejects weak password (no uppercase)', () => {
      expect(() => registerSchema.parse({ ...valid, password: 'lowercase1!' })).toThrow();
    });

    it('rejects weak password (no number)', () => {
      expect(() => registerSchema.parse({ ...valid, password: 'NoNumberHere!' })).toThrow();
    });

    it('rejects short phone', () => {
      expect(() => registerSchema.parse({ ...valid, phone: '123' })).toThrow();
    });

    it('rejects invalid country (not 2 chars)', () => {
      expect(() => registerSchema.parse({ ...valid, country: 'USA' })).toThrow();
      expect(() => registerSchema.parse({ ...valid, country: 'U' })).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      expect(() => loginSchema.parse({ email: 'u@x.com', password: 'anything' })).not.toThrow();
    });

    it('rejects invalid email', () => {
      expect(() => loginSchema.parse({ email: 'bad', password: 'x' })).toThrow();
    });

    it('rejects empty password', () => {
      expect(() => loginSchema.parse({ email: 'u@x.com', password: '' })).toThrow();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('accepts valid email', () => {
      expect(() => forgotPasswordSchema.parse({ email: 'user@example.com' })).not.toThrow();
    });

    it('rejects invalid email', () => {
      expect(() => forgotPasswordSchema.parse({ email: 'invalid' })).toThrow();
    });
  });

  describe('resetPasswordSchema', () => {
    const valid = {
      email: 'u@x.com',
      code: '123456',
      newPassword: 'NewSecure1!',
    };

    it('accepts valid reset data', () => {
      expect(() => resetPasswordSchema.parse(valid)).not.toThrow();
    });

    it('rejects code not 6 chars', () => {
      expect(() => resetPasswordSchema.parse({ ...valid, code: '12345' })).toThrow();
      expect(() => resetPasswordSchema.parse({ ...valid, code: '1234567' })).toThrow();
    });

    it('rejects weak newPassword', () => {
      expect(() => resetPasswordSchema.parse({ ...valid, newPassword: 'short' })).toThrow();
    });
  });
});
