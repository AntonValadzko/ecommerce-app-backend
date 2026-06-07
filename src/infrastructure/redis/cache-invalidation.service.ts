import { Injectable } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

@Injectable()
export class CacheInvalidationService {
  constructor(private readonly cache: RedisCacheService) {}

  /** Invalidate list/facet/autocomplete/product caches after catalog changes. */
  async onCatalogMutation(): Promise<void> {
    await this.cache.bumpVersion();
  }
}
