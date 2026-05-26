export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'popularity'
  | 'newest';

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  popularityScore: number;
  imageUrl: string;
  attributes: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}

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

export interface ProductQuery {
  search?: string;
  categoryId?: number;
  categorySlug?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  attributes?: Record<string, string[]>;
  sort?: SortOption;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface AutocompleteSuggestion {
  type: 'product' | 'brand' | 'category';
  id: number | string;
  label: string;
  slug?: string;
  highlight?: string;
}

export interface FilterFacets {
  brands: { name: string; count: number }[];
  priceRange: { min: number; max: number };
  ratings: { threshold: number; count: number }[];
  attributes: Record<string, { value: string; count: number }[]>;
  categories: { id: number; name: string; slug: string; count: number }[];
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
