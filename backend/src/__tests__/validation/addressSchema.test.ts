import { createAddressSchema, updateAddressSchema } from '../../validation/addressSchema';

describe('addressSchema', () => {
  const validCreate = {
    street: '123 Main St',
    city: 'NYC',
    postalCode: '10001',
    country: 'US',
  };

  describe('createAddressSchema', () => {
    it('accepts valid address', () => {
      expect(() => createAddressSchema.parse(validCreate)).not.toThrow();
    });

    it('accepts with state and isDefault', () => {
      expect(() => createAddressSchema.parse({ ...validCreate, state: 'NY', isDefault: true })).not.toThrow();
    });

    it('rejects short street', () => {
      expect(() => createAddressSchema.parse({ ...validCreate, street: '123' })).toThrow();
    });

    it('rejects short city', () => {
      expect(() => createAddressSchema.parse({ ...validCreate, city: 'N' })).toThrow();
    });

    it('rejects short postalCode', () => {
      expect(() => createAddressSchema.parse({ ...validCreate, postalCode: '12' })).toThrow();
    });

    it('rejects short country', () => {
      expect(() => createAddressSchema.parse({ ...validCreate, country: 'U' })).toThrow();
    });
  });

  describe('updateAddressSchema', () => {
    it('accepts partial updates', () => {
      expect(() => updateAddressSchema.parse({})).not.toThrow();
      expect(() => updateAddressSchema.parse({ city: 'LA' })).not.toThrow();
    });

    it('rejects invalid partial street length', () => {
      expect(() => updateAddressSchema.parse({ street: 'ab' })).toThrow();
    });
  });
});
