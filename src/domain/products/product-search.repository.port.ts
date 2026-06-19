import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  ProductListItem,
  ProductQuery,
} from './product.model';

export const PRODUCT_SEARCH_REPOSITORY = Symbol('PRODUCT_SEARCH_REPOSITORY');
/** Inner search backend (Postgres or OpenSearch) before optional Redis cache decorator. */
export const PRODUCT_SEARCH_BACKEND = Symbol('PRODUCT_SEARCH_BACKEND');

export interface IProductSearchRepository {
  findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>>;
  getFacets(query: ProductQuery): Promise<FilterFacets>;
  autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]>;
}
