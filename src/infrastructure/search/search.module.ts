import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entities/product.entity';
import { PRODUCT_SEARCH_REPOSITORY } from '../../domain/products/product-search.repository.port';
import { OpenSearchClientProvider } from './opensearch.client';
import { OpenSearchIndexService } from './opensearch-index.service';
import { OpenSearchProductSearchRepository } from './opensearch-product-search.repository';
import { ProductIndexerService } from './product-indexer.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  providers: [
    OpenSearchClientProvider,
    OpenSearchIndexService,
    OpenSearchProductSearchRepository,
    ProductIndexerService,
    { provide: PRODUCT_SEARCH_REPOSITORY, useExisting: OpenSearchProductSearchRepository },
  ],
  exports: [PRODUCT_SEARCH_REPOSITORY, ProductIndexerService, OpenSearchIndexService],
})
export class SearchModule {}
