import type { SavedSearch } from '../entities/saved-search.js';
import type { ProductQuery } from '../entities/product.js';

export interface ISavedSearchRepository {
  findBySession(sessionId: string): Promise<SavedSearch[]>;
  findById(id: string): Promise<SavedSearch | null>;
  create(data: {
    sessionId: string;
    name: string;
    query: ProductQuery;
  }): Promise<SavedSearch>;
  delete(id: string, sessionId: string): Promise<boolean>;
}
