import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PRODUCT_INDEXER } from '../../domain/products/product-index.port';
import {
  PRODUCT_SEARCH_BACKEND,
  PRODUCT_SEARCH_REPOSITORY,
  type IProductSearchRepository,
} from '../../domain/products/product-search.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/products/product.repository.port';
import { CATEGORY_REPOSITORY } from '../../domain/categories/category.repository.port';
import { SAVED_SEARCH_REPOSITORY } from '../../domain/saved-searches/saved-search.repository.port';
import { PostgresProductSearchRepository } from '../persistence/repositories/postgres-product-search.repository';
import { ProductRepository } from '../persistence/repositories/product.repository';
import { CategoryRepository } from '../persistence/repositories/category.repository';
import { SavedSearchRepository } from '../persistence/repositories/saved-search.repository';
import { CachedProductSearchRepository } from '../redis/repositories/cached-product-search.repository';
import { CachedProductRepository } from '../redis/repositories/cached-product.repository';
import { CachedCategoryRepository } from '../redis/repositories/cached-category.repository';
import { CachedSavedSearchRepository } from '../redis/repositories/cached-saved-search.repository';
import { OpenSearchProductSearchRepository } from './opensearch-product-search.repository';
import { ProductIndexerService } from './product-indexer.service';
import { NoOpProductIndexer } from './noop-product-indexer.service';

export function createProductSearchBackendProvider(): Provider {
  return {
    provide: PRODUCT_SEARCH_BACKEND,
    useFactory: (
      config: ConfigService,
      postgres: PostgresProductSearchRepository,
      opensearch: OpenSearchProductSearchRepository,
    ) => (config.get<boolean>('opensearch.enabled') ? opensearch : postgres),
    inject: [ConfigService, PostgresProductSearchRepository, OpenSearchProductSearchRepository],
  };
}

export function createProductSearchRepositoryProvider(): Provider {
  return {
    provide: PRODUCT_SEARCH_REPOSITORY,
    useFactory: (
      config: ConfigService,
      cached: CachedProductSearchRepository,
      backend: IProductSearchRepository,
    ) => (config.get<boolean>('redis.enabled') ? cached : backend),
    inject: [ConfigService, CachedProductSearchRepository, PRODUCT_SEARCH_BACKEND],
  };
}

export function createProductIndexerProvider(): Provider {
  return {
    provide: PRODUCT_INDEXER,
    useFactory: (config: ConfigService, indexer: ProductIndexerService, noop: NoOpProductIndexer) =>
      config.get<boolean>('opensearch.enabled') ? indexer : noop,
    inject: [ConfigService, ProductIndexerService, NoOpProductIndexer],
  };
}

export function createProductRepositoryProvider(): Provider {
  return {
    provide: PRODUCT_REPOSITORY,
    useFactory: (config: ConfigService, cached: CachedProductRepository, inner: ProductRepository) =>
      config.get<boolean>('redis.enabled') ? cached : inner,
    inject: [ConfigService, CachedProductRepository, ProductRepository],
  };
}

export function createCategoryRepositoryProvider(): Provider {
  return {
    provide: CATEGORY_REPOSITORY,
    useFactory: (config: ConfigService, cached: CachedCategoryRepository, inner: CategoryRepository) =>
      config.get<boolean>('redis.enabled') ? cached : inner,
    inject: [ConfigService, CachedCategoryRepository, CategoryRepository],
  };
}

export function createSavedSearchRepositoryProvider(): Provider {
  return {
    provide: SAVED_SEARCH_REPOSITORY,
    useFactory: (
      config: ConfigService,
      cached: CachedSavedSearchRepository,
      inner: SavedSearchRepository,
    ) => (config.get<boolean>('redis.enabled') ? cached : inner),
    inject: [ConfigService, CachedSavedSearchRepository, SavedSearchRepository],
  };
}
