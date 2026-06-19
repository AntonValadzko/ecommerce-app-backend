import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PRODUCT_INDEXER } from '../../domain/products/product-index.port';
import { PRODUCT_SEARCH_REPOSITORY } from '../../domain/products/product-search.repository.port';
import { ProductEntity } from '../../database/entities/product.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { RedisModule } from '../redis/redis.module';
import { PostgresProductSearchRepository } from '../persistence/repositories/postgres-product-search.repository';
import { CachedProductSearchRepository } from '../redis/repositories/cached-product-search.repository';
import { OpenSearchClientProvider } from './opensearch.client';
import { OpenSearchIndexService } from './opensearch-index.service';
import { OpenSearchProductSearchRepository } from './opensearch-product-search.repository';
import { ProductIndexerService } from './product-indexer.service';
import { ProductIndexQueueService } from './product-index-queue.service';
import { NoOpProductIndexer } from './noop-product-indexer.service';
import {
  createProductIndexerProvider,
  createProductSearchBackendProvider,
  createProductSearchRepositoryProvider,
} from './search.providers';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity]), RedisModule],
  providers: [
    PostgresProductSearchRepository,
    OpenSearchClientProvider,
    OpenSearchIndexService,
    OpenSearchProductSearchRepository,
    CachedProductSearchRepository,
    ProductIndexerService,
    NoOpProductIndexer,
    ProductIndexQueueService,
    createProductSearchBackendProvider(),
    createProductSearchRepositoryProvider(),
    createProductIndexerProvider(),
  ],
  exports: [
    OpenSearchClientProvider,
    PRODUCT_SEARCH_REPOSITORY,
    PRODUCT_INDEXER,
    ProductIndexerService,
    ProductIndexQueueService,
    OpenSearchIndexService,
  ],
})
export class SearchModule {}
