import { buildBoolQuery, buildSort, resolveSortKey } from './opensearch-query.builder';

describe('opensearch-query.builder', () => {
  describe('buildBoolQuery', () => {
    it('uses match_all when no filters', () => {
      expect(buildBoolQuery({})).toEqual({ bool: { must: [{ match_all: {} }] } });
    });

    it('adds search, category, brand, price, rating, stock, and attribute filters', () => {
      const query = buildBoolQuery({
        search: ' phone ',
        categoryId: 1,
        categorySlug: 'phones',
        brand: ['Apple'],
        minPrice: 10,
        maxPrice: 100,
        minRating: 4,
        inStock: true,
        attributes: { Color: ['Black'] },
      });

      expect(query.bool.must).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ multi_match: expect.objectContaining({ query: 'phone' }) }),
          { term: { categoryId: 1 } },
          { term: { categorySlug: 'phones' } },
          { terms: { brand: ['Apple'] } },
          { range: { price: { gte: 10, lte: 100 } } },
          { range: { rating: { gte: 4 } } },
          { term: { inStock: true } },
          expect.objectContaining({ nested: expect.any(Object) }),
        ]),
      );
    });

    it('excludes selected facet dimensions', () => {
      const query = buildBoolQuery(
        { brand: ['Apple'], minPrice: 1, categoryId: 2 },
        { brand: true, price: true, category: true },
      );

      expect(query.bool.must).toEqual([{ match_all: {} }]);
    });
  });

  describe('buildSort', () => {
    it('uses relevance sort when searching', () => {
      expect(buildSort(undefined, true)[0]).toEqual({ _score: 'desc' });
    });

    it('uses popularity when not searching', () => {
      expect(buildSort(undefined, false)[0]).toEqual({ popularityScore: 'desc' });
    });

    it('supports explicit price sort', () => {
      expect(buildSort('price_asc', false)).toEqual([{ price: 'asc' }, { id: 'asc' }]);
      expect(buildSort('price_desc', false)).toEqual([{ price: 'desc' }, { id: 'desc' }]);
      expect(buildSort('rating', false)).toEqual([
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { id: 'desc' },
      ]);
      expect(buildSort('newest', false)).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
      expect(buildSort('popularity', false)).toEqual([{ popularityScore: 'desc' }, { id: 'desc' }]);
    });
  });

  describe('resolveSortKey', () => {
    it('defaults to relevance with search and popularity without', () => {
      expect(resolveSortKey(undefined, true)).toBe('relevance');
      expect(resolveSortKey(undefined, false)).toBe('popularity');
    });

    it('keeps explicit sort', () => {
      expect(resolveSortKey('newest', false)).toBe('newest');
    });
  });
});
