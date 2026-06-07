import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttributeEntity } from '../../database/entities/product-attribute.entity';
import { PRODUCT_REPOSITORY } from '../../domain/products/product.repository.port';
import { CATEGORY_REPOSITORY } from '../../domain/categories/category.repository.port';
import { SAVED_SEARCH_REPOSITORY } from '../../domain/saved-searches/saved-search.repository.port';
import { RedisModule } from '../redis/redis.module';
import { SearchModule } from '../search/search.module';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { SavedSearchRepository } from './repositories/saved-search.repository';
import { CachedProductRepository } from '../redis/repositories/cached-product.repository';
import { CachedCategoryRepository } from '../redis/repositories/cached-category.repository';
import { CachedSavedSearchRepository } from '../redis/repositories/cached-saved-search.repository';

@Global()
@Module({
  imports: [RedisModule, SearchModule, TypeOrmModule.forFeature([ProductAttributeEntity])],
  providers: [
    ProductRepository,
    CategoryRepository,
    SavedSearchRepository,
    CachedProductRepository,
    CachedCategoryRepository,
    CachedSavedSearchRepository,
    { provide: PRODUCT_REPOSITORY, useExisting: CachedProductRepository },
    { provide: CATEGORY_REPOSITORY, useExisting: CachedCategoryRepository },
    { provide: SAVED_SEARCH_REPOSITORY, useExisting: CachedSavedSearchRepository },
  ],
  exports: [PRODUCT_REPOSITORY, CATEGORY_REPOSITORY, SAVED_SEARCH_REPOSITORY, SearchModule],
})
export class PersistenceModule {}
