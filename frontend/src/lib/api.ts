import type {
  AutocompleteSuggestion,
  CatalogQuery,
  Category,
  Facets,
  Product,
  ProductsResponse,
  QuickViewProduct,
  SavedSearch,
} from './types';

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1';
  }
  const host = process.env.API_URL ?? 'http://localhost:3000';
  return `${host}/api/v1`;
}
const SESSION_KEY = 'catalog-session-id';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function updateSessionFromResponse(response: Response): void {
  const sessionId = response.headers.get('x-session-id');
  if (sessionId && typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, sessionId);
  }
}

export function buildQueryString(query: CatalogQuery): string {
  const params = new URLSearchParams();

  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  if (query.brand?.length) query.brand.forEach((b) => params.append('brand', b));
  if (query.minPrice !== undefined) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice));
  if (query.minRating !== undefined) params.set('minRating', String(query.minRating));
  if (query.inStock) params.set('inStock', 'true');
  if (query.sort) params.set('sort', query.sort);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.scroll) params.set('scroll', 'true');
  if (query.attributes && Object.keys(query.attributes).length > 0) {
    params.set('attributes', JSON.stringify(query.attributes));
  }

  const str = params.toString();
  return str ? `?${str}` : '';
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const sessionId = getSessionId();
  if (sessionId) headers.set('x-session-id', sessionId);

  const response = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers,
  });

  updateSessionFromResponse(response);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getProducts: (query: CatalogQuery) =>
    apiFetch<ProductsResponse>(`/products${buildQueryString(query)}`),

  getFacets: (query: CatalogQuery) =>
    apiFetch<{ data: Facets }>(`/products/facets${buildQueryString(query)}`),

  autocomplete: (q: string) =>
    apiFetch<{ data: AutocompleteSuggestion[] }>(
      `/products/autocomplete?q=${encodeURIComponent(q)}`
    ),

  getProduct: (id: number) =>
    apiFetch<{ data: Product; meta: { seo: import('./types').SeoMeta } }>(`/products/${id}`),

  getProductBySlug: (slug: string) =>
    apiFetch<{ data: Product; meta: { seo: import('./types').SeoMeta } }>(
      `/products/slug/${slug}`
    ),

  getQuickView: (id: number) =>
    apiFetch<{ data: QuickViewProduct }>(`/products/${id}/quick-view`),

  getRelated: (id: number) =>
    apiFetch<{ data: import('./types').ProductListItem[] }>(`/products/${id}/related`),

  getCategories: () => apiFetch<{ data: Category[] }>('/categories'),

  getSavedSearches: () => apiFetch<{ data: SavedSearch[] }>('/saved-searches'),

  saveSearch: (name: string, query: CatalogQuery) =>
    apiFetch<{ data: SavedSearch }>('/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, query }),
    }),

  deleteSavedSearch: (id: string) =>
    apiFetch<void>(`/saved-searches/${id}`, { method: 'DELETE' }),
};
