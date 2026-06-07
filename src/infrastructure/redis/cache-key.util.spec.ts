import { hashObject, productQueryCacheKey } from './cache-key.util';

describe('cache-key.util', () => {
  describe('hashObject', () => {
    it('returns stable hash for same input', () => {
      expect(hashObject({ a: 1, b: 2 })).toBe(hashObject({ a: 1, b: 2 }));
    });

    it('returns different hash for different input', () => {
      expect(hashObject({ a: 1 })).not.toBe(hashObject({ a: 2 }));
    });
  });

  describe('productQueryCacheKey', () => {
    it('sorts brand arrays for stable keys', () => {
      const a = productQueryCacheKey({ brand: ['b', 'a'] });
      const b = productQueryCacheKey({ brand: ['a', 'b'] });

      expect(a).toBe(b);
    });

    it('normalizes missing fields consistently', () => {
      expect(productQueryCacheKey({})).toBe(productQueryCacheKey({ search: undefined }));
    });
  });
});
