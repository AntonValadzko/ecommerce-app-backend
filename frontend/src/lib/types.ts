export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'popularity'
  | 'newest';

export interface ProductListItem {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  imageUrl: string;
  popularityScore: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product extends ProductListItem {
  description: string;
  stockQuantity: number;
  attributes: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  parentId: number | null;
  description: string | null;
  productCount?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: string;
  structuredData: Record<string, unknown>;
}

export interface ProductsResponse {
  data: ProductListItem[];
  pagination: Pagination;
  meta: {
    sort: SortOption;
    pageSizeOptions: number[];
    infiniteScroll: boolean;
    seo: SeoMeta;
  };
}

export interface Facets {
  brands: { name: string; count: number }[];
  priceRange: { min: number; max: number };
  ratings: { threshold: number; count: number }[];
  attributes: Record<string, { value: string; count: number }[]>;
  categories: { id: number; name: string; slug: string; count: number }[];
}

export interface AutocompleteSuggestion {
  type: 'product' | 'brand' | 'category';
  id: number | string;
  label: string;
  slug?: string;
}

export interface SavedSearch {
  id: string;
  sessionId: string;
  name: string;
  query: CatalogQuery;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogQuery {
  q?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
  cursor?: string;
  scroll?: boolean;
  attributes?: Record<string, string[]>;
}

export interface QuickViewProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  imageUrl: string;
  attributes: ProductAttribute[];
}
