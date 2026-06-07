import { createHash } from 'crypto';
import type { ProductQuery } from '../../domain/products/product.model';

export function hashObject(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function productQueryCacheKey(query: ProductQuery): string {
  const normalized = {
    search: query.search ?? null,
    categoryId: query.categoryId ?? null,
    categorySlug: query.categorySlug ?? null,
    brand: query.brand?.slice().sort() ?? null,
    minPrice: query.minPrice ?? null,
    maxPrice: query.maxPrice ?? null,
    minRating: query.minRating ?? null,
    inStock: query.inStock ?? null,
    attributes: query.attributes ?? null,
    sort: query.sort ?? null,
    page: query.page ?? null,
    limit: query.limit ?? null,
    cursor: query.cursor ?? null,
  };
  return hashObject(normalized);
}
