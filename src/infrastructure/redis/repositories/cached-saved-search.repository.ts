import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ISavedSearchRepository } from '../../../domain/saved-searches/saved-search.repository.port';
import type { SavedSearch } from '../../../domain/saved-searches/saved-search.model';
import type { ProductQuery } from '../../../domain/products/product.model';
import { SavedSearchRepository } from '../../persistence/repositories/saved-search.repository';
import { RedisCacheService } from '../redis-cache.service';
import type { RedisConfig } from '../redis.types';

@Injectable()
export class CachedSavedSearchRepository implements ISavedSearchRepository {
  private readonly ttl: RedisConfig['cacheTtl'];

  constructor(
    private readonly inner: SavedSearchRepository,
    private readonly cache: RedisCacheService,
    configService: ConfigService,
  ) {
    this.ttl = configService.get<RedisConfig>('redis')!.cacheTtl;
  }

  findBySession(sessionId: string): Promise<SavedSearch[]> {
    return this.cache.wrap(`saved:${sessionId}`, this.ttl.savedSearches, () =>
      this.inner.findBySession(sessionId),
    );
  }

  async create(data: {
    sessionId: string;
    name: string;
    query: ProductQuery;
  }): Promise<SavedSearch> {
    const saved = await this.inner.create(data);
    await this.cache.del(`saved:${data.sessionId}`);
    return saved;
  }

  async delete(id: string, sessionId: string): Promise<boolean> {
    const deleted = await this.inner.delete(id, sessionId);
    if (deleted) {
      await this.cache.del(`saved:${sessionId}`);
    }
    return deleted;
  }
}
