import type { CatalogQuery, SortOption } from './types';

const SORT_OPTIONS: SortOption[] = [
  'relevance',
  'price_asc',
  'price_desc',
  'rating',
  'popularity',
  'newest',
];

const PAGE_SIZES = [24, 48, 96] as const;

export function parseCatalogParams(
  searchParams: Record<string, string | string[] | undefined>
): CatalogQuery {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const getAll = (key: string) => {
    const v = searchParams[key];
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const limitRaw = Number(get('limit'));
  const limit = PAGE_SIZES.includes(limitRaw as (typeof PAGE_SIZES)[number])
    ? limitRaw
    : 24;

  const sortRaw = get('sort') as SortOption | undefined;
  const sort = sortRaw && SORT_OPTIONS.includes(sortRaw) ? sortRaw : 'relevance';

  let attributes: Record<string, string[]> | undefined;
  const attrRaw = get('attributes');
  if (attrRaw) {
    try {
      attributes = JSON.parse(attrRaw) as Record<string, string[]>;
    } catch {
      attributes = undefined;
    }
  }

  return {
    q: get('q') || undefined,
    category: get('category') || undefined,
    brand: getAll('brand').length ? getAll('brand') : undefined,
    minPrice: get('minPrice') ? Number(get('minPrice')) : undefined,
    maxPrice: get('maxPrice') ? Number(get('maxPrice')) : undefined,
    minRating: get('minRating') ? Number(get('minRating')) : undefined,
    inStock: get('inStock') === 'true' ? true : undefined,
    sort,
    page: get('page') ? Number(get('page')) : 1,
    limit,
    cursor: get('cursor') || undefined,
    scroll: get('scroll') === 'true',
    attributes,
  };
}

export function catalogParamsToUrl(query: CatalogQuery): string {
  const params = new URLSearchParams();

  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  query.brand?.forEach((b) => params.append('brand', b));
  if (query.minPrice !== undefined) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice));
  if (query.minRating !== undefined) params.set('minRating', String(query.minRating));
  if (query.inStock) params.set('inStock', 'true');
  if (query.sort && query.sort !== 'relevance') params.set('sort', query.sort);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.limit && query.limit !== 24) params.set('limit', String(query.limit));
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.scroll) params.set('scroll', 'true');
  if (query.attributes && Object.keys(query.attributes).length > 0) {
    params.set('attributes', JSON.stringify(query.attributes));
  }

  const str = params.toString();
  return str ? `/?${str}` : '/';
}

export { PAGE_SIZES, SORT_OPTIONS };
