import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and replaces non-alphanumeric characters', () => {
    expect(slugify('  Foo Bar!!  ')).toBe('foo-bar');
  });

  it('returns empty string for symbols-only input', () => {
    expect(slugify('!!!')).toBe('');
  });

  it('preserves numbers', () => {
    expect(slugify('Product 123')).toBe('product-123');
  });
});
