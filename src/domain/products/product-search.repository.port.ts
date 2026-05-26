import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  ProductListItem,
  ProductQuery,
} from './product.model';

export const PRODUCT_SEARCH_REPOSITORY = Symbol('PRODUCT_SEARCH_REPOSITORY');

export interface IProductSearchRepository {
  findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>>;
  getFacets(query: ProductQuery): Promise<FilterFacets>;
  autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]>;
}
