import type { CatalogQuery, Category, SortOption } from './types';
import { formatPrice } from './format';

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevance',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  rating: 'Top Rated',
  popularity: 'Most Popular',
  newest: 'New Arrivals',
};

export interface ActiveFilterChip {
  id: string;
  label: string;
  clearPatch: Partial<CatalogQuery>;
}

export function hasActiveFilters(query: CatalogQuery): boolean {
  return (
    !!query.q ||
    !!query.category ||
    !!query.brand?.length ||
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.minRating !== undefined ||
    !!query.inStock ||
    (query.attributes !== undefined && Object.keys(query.attributes).length > 0) ||
    (query.sort !== undefined && query.sort !== 'relevance')
  );
}

export function buildActiveFilterChips(
  query: CatalogQuery,
  categories: Category[] = []
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (query.q) {
    chips.push({
      id: 'q',
      label: `Search: “${query.q}”`,
      clearPatch: { q: undefined },
    });
  }

  if (query.category) {
    const cat = categories.find((c) => c.slug === query.category);
    chips.push({
      id: 'category',
      label: `Category: ${cat?.name ?? query.category}`,
      clearPatch: { category: undefined },
    });
  }

  query.brand?.forEach((brand) => {
    const remaining = query.brand!.filter((b) => b !== brand);
    chips.push({
      id: `brand-${brand}`,
      label: `Brand: ${brand}`,
      clearPatch: { brand: remaining.length > 0 ? remaining : undefined },
    });
  });

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const min = query.minPrice;
    const max = query.maxPrice;
    let label = 'Price: ';
    if (min !== undefined && max !== undefined) {
      label += `${formatPrice(min)} – ${formatPrice(max)}`;
    } else if (min !== undefined) {
      label += `from ${formatPrice(min)}`;
    } else if (max !== undefined) {
      label += `up to ${formatPrice(max)}`;
    }
    chips.push({
      id: 'price',
      label,
      clearPatch: { minPrice: undefined, maxPrice: undefined },
    });
  }

  if (query.minRating !== undefined) {
    chips.push({
      id: 'rating',
      label: `${query.minRating}+ stars`,
      clearPatch: { minRating: undefined },
    });
  }

  if (query.inStock) {
    chips.push({
      id: 'inStock',
      label: 'In stock only',
      clearPatch: { inStock: undefined },
    });
  }

  if (query.attributes) {
    for (const [name, values] of Object.entries(query.attributes)) {
      for (const value of values) {
        chips.push({
          id: `attr-${name}-${value}`,
          label: `${name}: ${value}`,
          clearPatch: {
            attributes: removeAttributeValue(query.attributes!, name, value),
          },
        });
      }
    }
  }

  if (query.sort && query.sort !== 'relevance') {
    chips.push({
      id: 'sort',
      label: `Sort: ${SORT_LABELS[query.sort]}`,
      clearPatch: { sort: 'relevance' },
    });
  }

  return chips;
}

function removeAttributeValue(
  attrs: Record<string, string[]>,
  name: string,
  value: string
): Record<string, string[]> | undefined {
  const next = { ...attrs };
  const values = (next[name] ?? []).filter((v) => v !== value);
  if (values.length === 0) delete next[name];
  if (Object.keys(next).length === 0) return undefined;
  next[name] = values;
  return next;
}

export function summarizeQuery(q: CatalogQuery): string {
  const chips = buildActiveFilterChips(q);
  if (chips.length === 0) return 'All products';
  return chips.map((c) => c.label).join(' · ');
}

/** Query fields worth persisting as a saved search (excludes pagination state). */
export function toSavableQuery(query: CatalogQuery): CatalogQuery {
  const { page: _p, cursor: _c, scroll: _s, ...rest } = query;
  return rest;
}
