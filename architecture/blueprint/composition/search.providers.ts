/**
 * Blueprint — all search + cache bindings in one place (composition root).
 *
 * Compare: src/infrastructure/search/search.providers.ts (current)
 */
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const PRODUCT_SEARCH_REPOSITORY = Symbol('PRODUCT_SEARCH_REPOSITORY');
export const PRODUCT_SEARCH_BACKEND = Symbol('PRODUCT_SEARCH_BACKEND');

// Stubs — real app injects concrete adapter classes
type SearchRepo = {
  findMany(q: unknown): Promise<unknown>;
};
type OpenSearchRepo = SearchRepo;
type PostgresSearchRepo = SearchRepo;
type CachedSearchRepo = SearchRepo;

export function createSearchBackendProvider(): Provider {
  return {
    provide: PRODUCT_SEARCH_BACKEND,
    useFactory: (
      config: ConfigService,
      postgres: PostgresSearchRepo,
      opensearch: OpenSearchRepo,
    ) => (config.get<boolean>('opensearch.enabled') ? opensearch : postgres),
    inject: [ConfigService, 'PostgresProductSearchRepository', 'OpenSearchProductSearchRepository'],
  };
}

export function createSearchRepositoryProvider(): Provider {
  return {
    provide: PRODUCT_SEARCH_REPOSITORY,
    useFactory: (
      config: ConfigService,
      cached: CachedSearchRepo,
      backend: SearchRepo,
    ) => (config.get<boolean>('redis.enabled') ? cached : backend),
    inject: [ConfigService, 'CachedProductSearchRepository', PRODUCT_SEARCH_BACKEND],
  };
}

/** Product repo providers follow the same pattern — also live here, not in SearchModule. */
export function createProductRepositoryProvider(): Provider {
  return {
    provide: 'PRODUCT_REPOSITORY',
    useFactory: (config: ConfigService, cached: unknown, inner: unknown) =>
      config.get<boolean>('redis.enabled') ? cached : inner,
    inject: [ConfigService, 'CachedProductRepository', 'ProductRepository'],
  };
}
