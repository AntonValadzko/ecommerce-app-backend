import { Injectable, NotFoundException } from '@nestjs/common';
import { SavedSearchRepository } from './repositories/saved-search.repository';
import type { SavedSearch } from './saved-search.types';
import type { ProductQuery } from '../products/product.types';

@Injectable()
export class SavedSearchesService {
  constructor(private readonly savedSearchRepo: SavedSearchRepository) {}

  async list(sessionId: string): Promise<SavedSearch[]> {
    return this.savedSearchRepo.findBySession(sessionId);
  }

  async save(sessionId: string, name: string, query: ProductQuery): Promise<SavedSearch> {
    return this.savedSearchRepo.create({ sessionId, name, query });
  }

  async remove(id: string, sessionId: string): Promise<void> {
    const deleted = await this.savedSearchRepo.delete(id, sessionId);
    if (!deleted) {
      throw new NotFoundException(`Saved search "${id}" not found`);
    }
  }
}
