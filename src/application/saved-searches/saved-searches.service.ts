import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';
import type { ProductQuery } from '../../domain/products/product.model';
import {
  SAVED_SEARCH_REPOSITORY,
  type ISavedSearchRepository,
} from '../../domain/saved-searches/saved-search.repository.port';
import type { SavedSearch } from '../../domain/saved-searches/saved-search.model';

@Injectable()
export class SavedSearchesService {
  constructor(
    @Inject(SAVED_SEARCH_REPOSITORY)
    private readonly savedSearchRepo: ISavedSearchRepository,
  ) {}

  async list(sessionId: string): Promise<SavedSearch[]> {
    return this.savedSearchRepo.findBySession(sessionId);
  }

  async save(sessionId: string, name: string, query: ProductQuery): Promise<SavedSearch> {
    return this.savedSearchRepo.create({ sessionId, name, query });
  }

  async remove(id: string, sessionId: string): Promise<void> {
    const deleted = await this.savedSearchRepo.delete(id, sessionId);
    if (!deleted) throw new EntityNotFoundError('Saved search', id);
  }
}
