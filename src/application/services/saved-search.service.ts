import type { Repositories } from '../../infrastructure/repositories/index.js';
import type { SavedSearch } from '../../domain/entities/saved-search.js';
import type { ProductQuery } from '../../domain/entities/product.js';

export class SavedSearchService {
  constructor(private readonly repos: Repositories) {}

  async list(sessionId: string): Promise<SavedSearch[]> {
    return this.repos.savedSearches.findBySession(sessionId);
  }

  async save(sessionId: string, name: string, query: ProductQuery): Promise<SavedSearch> {
    return this.repos.savedSearches.create({ sessionId, name, query });
  }

  async remove(id: string, sessionId: string): Promise<boolean> {
    return this.repos.savedSearches.delete(id, sessionId);
  }
}
