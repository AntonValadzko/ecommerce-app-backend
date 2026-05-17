'use client';

import { Suspense, useState } from 'react';
import useSWR from 'swr';
import { useCatalog } from '@/hooks/use-catalog';
import { api } from '@/lib/api';
import type { AutocompleteSuggestion } from '@/lib/types';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Pagination } from '@/components/catalog/Pagination';
import { InfiniteScrollTrigger } from '@/components/catalog/InfiniteScrollTrigger';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { SavedSearchesPanel } from '@/components/catalog/SavedSearchesPanel';
import { ActiveFiltersBar } from '@/components/catalog/ActiveFiltersBar';

function CatalogContent() {
  const {
    query,
    setQuery,
    products,
    pagination,
    facets,
    isLoading,
    loadMore,
  } = useCatalog();

  const { data: categoriesData } = useSWR('categories', () => api.getCategories());
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [savedOpen, setSavedOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categories = categoriesData?.data ?? [];

  function handleSearch(q: string) {
    setQuery({ q: q || undefined });
  }

  function handleSuggestion(s: AutocompleteSuggestion) {
    if (s.type === 'product' && s.slug) {
      window.location.href = `/products/${s.slug}`;
    } else if (s.type === 'brand') {
      setQuery({ q: undefined, brand: [String(s.label)] });
    } else if (s.type === 'category' && s.slug) {
      setQuery({ category: s.slug, q: undefined });
    } else {
      setQuery({ q: s.label });
    }
  }

  function clearFilters() {
    setQuery({
      q: undefined,
      category: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStock: undefined,
      attributes: undefined,
    });
  }

  return (
    <>
      <section className="mb-6 space-y-4">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Product Catalog
          </h1>
          <button type="button" onClick={() => setSavedOpen(true)} className="btn-secondary">
            Saved searches
          </button>
        </section>
        <SearchBar query={query} onSearch={handleSearch} onSelectSuggestion={handleSuggestion} />
        <ActiveFiltersBar
          query={query}
          categories={categories}
          onChange={(patch) => setQuery(patch)}
          onClearAll={clearFilters}
          onOpenSavedSearches={() => setSavedOpen(true)}
        />
      </section>

      <section className="flex gap-6">
        <section className="hidden w-64 shrink-0 lg:block">
          <FilterSidebar
            query={query}
            facets={facets}
            categories={categories}
            onChange={(patch) => setQuery(patch)}
            onClear={clearFilters}
          />
        </section>

        <section id="catalog-results" className="min-w-0 flex-1 space-y-4 scroll-mt-24">
          <section className="flex gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="btn-secondary flex-1"
            >
              {mobileFiltersOpen ? 'Hide filters' : 'Show filters'}
            </button>
          </section>

          {mobileFiltersOpen && (
            <section className="lg:hidden">
              <FilterSidebar
                query={query}
                facets={facets}
                categories={categories}
                onChange={(patch) => setQuery(patch)}
                onClear={clearFilters}
              />
            </section>
          )}

          <CatalogToolbar query={query} pagination={pagination} onChange={setQuery} />
          <ProductGrid
            products={products}
            onQuickView={setQuickViewId}
            isLoading={isLoading}
          />

          {query.scroll ? (
            <InfiniteScrollTrigger
              hasMore={!!pagination?.hasMore}
              isLoading={isLoading}
              onLoadMore={loadMore}
            />
          ) : (
            pagination && (
              <Pagination
                pagination={pagination}
                onPageChange={(page) =>
                  setQuery({ page, cursor: undefined }, { resetPage: false })
                }
              />
            )
          )}
        </section>
      </section>

      {quickViewId !== null && (
        <QuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />
      )}
      <SavedSearchesPanel open={savedOpen} onClose={() => setSavedOpen(false)} />
    </>
  );
}

export function CatalogPage() {
  return (
    <Suspense
      fallback={
        <section className="py-12 text-center text-slate-500">Loading catalog…</section>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
