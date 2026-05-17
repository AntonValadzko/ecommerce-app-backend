import type {
  PaginatedResult,
  Product,
  ProductListItem,
  ProductQuery,
} from '../entities/product.js';

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

export interface IProductRepository {
  findById(id: number): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>>;
  autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]>;
  getFacets(query: ProductQuery): Promise<FilterFacets>;
  findRelated(productId: number, limit: number): Promise<ProductListItem[]>;
}
