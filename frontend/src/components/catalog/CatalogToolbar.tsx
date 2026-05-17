'use client';

import type { CatalogQuery, Pagination, SortOption } from '@/lib/types';
import { PAGE_SIZES } from '@/lib/catalog-params';

const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevance',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  rating: 'Top Rated',
  popularity: 'Most Popular',
  newest: 'New Arrivals',
};

interface CatalogToolbarProps {
  query: CatalogQuery;
  pagination?: Pagination;
  onChange: (patch: Partial<CatalogQuery>) => void;
}

export function CatalogToolbar({ query, pagination, onChange }: CatalogToolbarProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-surface-border bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        {pagination ? (
          <>
            <span className="font-semibold text-slate-900">
              {pagination.total.toLocaleString()}
            </span>{' '}
            products
            {query.q && (
              <>
                {' '}
                for &ldquo;<span className="font-medium">{query.q}</span>&rdquo;
              </>
            )}
          </>
        ) : (
          'Loading…'
        )}
      </p>

      <section className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Sort</span>
          <select
            value={query.sort ?? 'relevance'}
            onChange={(e) => onChange({ sort: e.target.value as SortOption })}
            className="input w-auto py-1.5"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Per page</span>
          <select
            value={query.limit ?? 24}
            onChange={(e) => onChange({ limit: Number(e.target.value) })}
            className="input w-auto py-1.5"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!query.scroll}
            onChange={(e) =>
              onChange({
                scroll: e.target.checked,
                page: 1,
                cursor: undefined,
              })
            }
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-slate-600">Infinite scroll</span>
        </label>
      </section>
    </section>
  );
}
