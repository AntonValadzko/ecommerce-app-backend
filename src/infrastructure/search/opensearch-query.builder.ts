import type { ProductQuery, SortOption } from '../../domain/products/product.model';

export interface FilterExclusions {
  brand?: boolean;
  price?: boolean;
  rating?: boolean;
  attributes?: boolean;
  category?: boolean;
}

type BoolClause = Record<string, unknown>;

export function buildBoolQuery(
  query: ProductQuery,
  exclude: FilterExclusions = {},
): { bool: Record<string, BoolClause[]> } {
  const must: BoolClause[] = [];

  if (query.search?.trim()) {
    must.push({
      multi_match: {
        query: query.search.trim(),
        fields: ['name^3', 'description', 'sku^2', 'brand^2'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  }

  if (!exclude.category) {
    if (query.categoryId) {
      must.push({ term: { categoryId: query.categoryId } });
    }
    if (query.categorySlug) {
      must.push({ term: { categorySlug: query.categorySlug } });
    }
  }

  if (!exclude.brand && query.brand?.length) {
    must.push({ terms: { brand: query.brand } });
  }

  if (!exclude.price) {
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const range: Record<string, number> = {};
      if (query.minPrice !== undefined) range.gte = query.minPrice;
      if (query.maxPrice !== undefined) range.lte = query.maxPrice;
      must.push({ range: { price: range } });
    }
  }

  if (!exclude.rating && query.minRating !== undefined) {
    must.push({ range: { rating: { gte: query.minRating } } });
  }

  if (query.inStock === true) {
    must.push({ term: { inStock: true } });
  }

  if (!exclude.attributes && query.attributes) {
    for (const [name, values] of Object.entries(query.attributes)) {
      if (!values.length) continue;
      must.push({
        nested: {
          path: 'attributes',
          query: {
            bool: {
              must: [{ term: { 'attributes.name': name } }, { terms: { 'attributes.value': values } }],
            },
          },
        },
      });
    }
  }

  return { bool: { must: must.length ? must : [{ match_all: {} }] } };
}

export function buildSort(sort: SortOption | undefined, hasSearch: boolean): Record<string, 'asc' | 'desc'>[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, { id: 'asc' }];
    case 'price_desc':
      return [{ price: 'desc' }, { id: 'desc' }];
    case 'rating':
      return [{ rating: 'desc' }, { reviewCount: 'desc' }, { id: 'desc' }];
    case 'newest':
      return [{ createdAt: 'desc' }, { id: 'desc' }];
    case 'popularity':
      return [{ popularityScore: 'desc' }, { id: 'desc' }];
    case 'relevance':
    default:
      return hasSearch
        ? [{ _score: 'desc' }, { popularityScore: 'desc' }, { id: 'desc' }]
        : [{ popularityScore: 'desc' }, { id: 'desc' }];
  }
}

export function resolveSortKey(sort: SortOption | undefined, hasSearch: boolean): SortOption {
  if (sort) return sort;
  return hasSearch ? 'relevance' : 'popularity';
}
