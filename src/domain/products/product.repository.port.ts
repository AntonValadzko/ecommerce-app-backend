import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  Product,
  ProductListItem,
  ProductQuery,
  QuickViewProduct,
} from './product.model';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  findById(id: number): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findQuickView(id: number): Promise<QuickViewProduct | null>;
  findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>>;
  getFacets(query: ProductQuery): Promise<FilterFacets>;
  autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]>;
  findRelated(productId: number, limit: number): Promise<ProductListItem[]>;
}
