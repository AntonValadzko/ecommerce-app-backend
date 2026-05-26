import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SavedSearchEntity } from '../../../database/entities/saved-search.entity';
import { toSavedSearch, toSavedSearchEntity } from '../../../database/mappers/saved-search.mapper';
import type { ISavedSearchRepository } from '../../../domain/saved-searches/saved-search.repository.port';
import type { SavedSearch } from '../../../domain/saved-searches/saved-search.model';
import type { ProductQuery } from '../../../domain/products/product.model';

@Injectable()
export class SavedSearchRepository implements ISavedSearchRepository {
  constructor(
    @InjectRepository(SavedSearchEntity)
    private readonly savedSearchRepo: Repository<SavedSearchEntity>,
  ) {}

  async findBySession(sessionId: string): Promise<SavedSearch[]> {
    const entities = await this.savedSearchRepo.find({
      where: { sessionId },
      order: { updatedAt: 'DESC' },
    });
    return entities.map(toSavedSearch);
  }

  async create(data: {
    sessionId: string;
    name: string;
    query: ProductQuery;
  }): Promise<SavedSearch> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const entity = toSavedSearchEntity({
      id,
      sessionId: data.sessionId,
      name: data.name,
      query: data.query,
      createdAt: now,
      updatedAt: now,
    });

    await this.savedSearchRepo.save(entity);
    return toSavedSearch(entity);
  }

  async delete(id: string, sessionId: string): Promise<boolean> {
    const result = await this.savedSearchRepo.delete({ id, sessionId });
    return (result.affected ?? 0) > 0;
  }
}
