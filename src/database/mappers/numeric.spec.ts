import { toNumber, toOptionalNumber } from './numeric';

describe('numeric mappers', () => {
  describe('toNumber', () => {
    it('parses postgres decimal strings', () => {
      expect(toNumber('12.50')).toBe(12.5);
    });

    it('returns 0 for null, empty, or invalid values', () => {
      expect(toNumber(null)).toBe(0);
      expect(toNumber('')).toBe(0);
      expect(toNumber('abc')).toBe(0);
    });
  });

  describe('toOptionalNumber', () => {
    it('returns null for null, empty, or invalid values', () => {
      expect(toOptionalNumber(null)).toBeNull();
      expect(toOptionalNumber('')).toBeNull();
      expect(toOptionalNumber('abc')).toBeNull();
    });

    it('parses valid numbers', () => {
      expect(toOptionalNumber('9.99')).toBe(9.99);
    });
  });
});
