'use client';

import type { CatalogQuery, Facets } from '@/lib/types';
import { cn } from '@/lib/cn';
import { preventFocusScroll } from '@/lib/prevent-focus-scroll';
import { PriceRangeSlider } from './PriceRangeSlider';

interface FilterSidebarProps {
  query: CatalogQuery;
  facets?: Facets;
  categories: { slug: string; name: string; productCount?: number }[];
  onChange: (patch: Partial<CatalogQuery>) => void;
  onClear: () => void;
}

export function FilterSidebar({
  query,
  facets,
  categories,
  onChange,
  onClear,
}: FilterSidebarProps) {
  const priceMin = facets?.priceRange.min ?? 0;
  const priceMax = facets?.priceRange.max ?? 1000;

  const selectedBrands = new Set(query.brand ?? []);
  const selectedAttrs = query.attributes ?? {};

  function toggleBrand(brand: string) {
    const next = new Set(selectedBrands);
    if (next.has(brand)) next.delete(brand);
    else next.add(brand);
    onChange({ brand: [...next] });
  }

  function toggleAttribute(name: string, value: string) {
    const current = new Set(selectedAttrs[name] ?? []);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    const next = { ...selectedAttrs };
    if (current.size === 0) delete next[name];
    else next[name] = [...current];
    onChange({ attributes: next });
  }

  function toggleRating(threshold: number) {
    onChange({ minRating: query.minRating === threshold ? undefined : threshold });
  }

  const hasFilters =
    query.category ||
    query.brand?.length ||
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.minRating !== undefined ||
    query.inStock ||
    (query.attributes && Object.keys(query.attributes).length > 0);

  return (
    <aside className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-6 overflow-y-auto rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Filters
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onMouseDown={preventFocusScroll}
              onClick={() => onChange({ category: undefined })}
              className={cn(
                'w-full rounded-md px-2 py-1.5 text-left text-sm',
                !query.category ? 'bg-brand-50 font-medium text-brand-700' : 'hover:bg-slate-50'
              )}
            >
              All categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                type="button"
                onMouseDown={preventFocusScroll}
                onClick={() => onChange({ category: cat.slug })}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm',
                  query.category === cat.slug
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'hover:bg-slate-50'
                )}
              >
                <span>{cat.name}</span>
                {cat.productCount !== undefined && (
                  <span className="text-xs text-slate-400">{cat.productCount}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {facets && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Price range</h3>
          <PriceRangeSlider
            min={priceMin}
            max={priceMax}
            valueMin={query.minPrice ?? priceMin}
            valueMax={query.maxPrice ?? priceMax}
            onChange={(min, max) => onChange({ minPrice: min, maxPrice: max })}
          />
        </section>
      )}

      {facets && facets.brands.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Brand</h3>
          <ul className="max-h-48 space-y-0.5 overflow-y-auto">
            {facets.brands.map((b) => (
              <li key={b.name}>
                <label className="checkbox-label" onMouseDown={preventFocusScroll}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.has(b.name)}
                    onChange={() => toggleBrand(b.name)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="flex-1">{b.name}</span>
                  <span className="text-xs text-slate-400">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {facets && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Customer rating</h3>
          <ul className="space-y-1">
            {[4, 3, 2, 1].map((threshold) => {
              const facet = facets.ratings.find((r) => r.threshold === threshold);
              return (
                <li key={threshold}>
                  <button
                    type="button"
                    onMouseDown={preventFocusScroll}
                    onClick={() => toggleRating(threshold)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm',
                      query.minRating === threshold
                        ? 'bg-brand-50 font-medium text-brand-700'
                        : 'hover:bg-slate-50'
                    )}
                  >
                    <span>{threshold}+ stars</span>
                    {facet && <span className="text-xs text-slate-400">{facet.count}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <label className="checkbox-label" onMouseDown={preventFocusScroll}>
          <input
            type="checkbox"
            checked={!!query.inStock}
            onChange={(e) => onChange({ inStock: e.target.checked || undefined })}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>In stock only</span>
        </label>
      </section>

      {facets &&
        Object.entries(facets.attributes).map(([name, values]) => (
          <section key={name}>
            <h3 className="mb-3 text-sm font-semibold capitalize text-slate-800">{name}</h3>
            <ul className="max-h-36 space-y-0.5 overflow-y-auto">
              {values.map((v) => (
                <li key={v.value}>
                  <label className="checkbox-label" onMouseDown={preventFocusScroll}>
                    <input
                      type="checkbox"
                      checked={(selectedAttrs[name] ?? []).includes(v.value)}
                      onChange={() => toggleAttribute(name, v.value)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="flex-1">{v.value}</span>
                    <span className="text-xs text-slate-400">{v.count}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </aside>
  );
}
