import type { ProductQuery } from '../products/product.model';
import type { SavedSearch } from './saved-search.model';

export const SAVED_SEARCH_REPOSITORY = Symbol('SAVED_SEARCH_REPOSITORY');

export interface ISavedSearchRepository {
  findBySession(sessionId: string): Promise<SavedSearch[]>;
  create(data: { sessionId: string; name: string; query: ProductQuery }): Promise<SavedSearch>;
  delete(id: string, sessionId: string): Promise<boolean>;
}
