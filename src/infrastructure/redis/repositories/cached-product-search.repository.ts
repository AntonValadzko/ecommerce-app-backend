import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PRODUCT_SEARCH_BACKEND,
  type IProductSearchRepository,
} from '../../../domain/products/product-search.repository.port';
import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  ProductListItem,
  ProductQuery,
} from '../../../domain/products/product.model';
import { productQueryCacheKey } from '../cache-key.util';
import { RedisCacheService } from '../redis-cache.service';
import type { RedisConfig } from '../redis.types';

@Injectable()
export class CachedProductSearchRepository implements IProductSearchRepository {
  private readonly ttl: RedisConfig['cacheTtl'];

  constructor(
    @Inject(PRODUCT_SEARCH_BACKEND)
    private readonly inner: IProductSearchRepository,
    private readonly cache: RedisCacheService,
    configService: ConfigService,
  ) {
    this.ttl = configService.get<RedisConfig>('redis')!.cacheTtl;
  }

  findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>> {
    return this.cache.wrap(
      this.cache.versionedKey(['list', productQueryCacheKey(query)]),
      this.ttl.list,
      () => this.inner.findMany(query),
    );
  }

  getFacets(query: ProductQuery): Promise<FilterFacets> {
    return this.cache.wrap(
      this.cache.versionedKey(['facets', productQueryCacheKey(query)]),
      this.ttl.facets,
      () => this.inner.getFacets(query),
    );
  }

  autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]> {
    return this.cache.wrap(
      this.cache.versionedKey(['autocomplete', term.trim().toLowerCase(), String(limit)]),
      this.ttl.autocomplete,
      () => this.inner.autocomplete(term, limit),
    );
  }
}
