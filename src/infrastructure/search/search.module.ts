import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entities/product.entity';
import { PRODUCT_INDEXER } from '../../domain/products/product-index.port';
import { PRODUCT_SEARCH_REPOSITORY } from '../../domain/products/product-search.repository.port';
import { RedisModule } from '../redis/redis.module';
import { CachedProductSearchRepository } from '../redis/repositories/cached-product-search.repository';
import { OpenSearchClientProvider } from './opensearch.client';
import { OpenSearchIndexService } from './opensearch-index.service';
import { OpenSearchProductSearchRepository } from './opensearch-product-search.repository';
import { ProductIndexerService } from './product-indexer.service';
import { ProductIndexQueueService } from './product-index-queue.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), RedisModule],
  providers: [
    OpenSearchClientProvider,
    OpenSearchIndexService,
    OpenSearchProductSearchRepository,
    CachedProductSearchRepository,
    ProductIndexerService,
    ProductIndexQueueService,
    { provide: PRODUCT_SEARCH_REPOSITORY, useExisting: CachedProductSearchRepository },
    { provide: PRODUCT_INDEXER, useExisting: ProductIndexerService },
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
