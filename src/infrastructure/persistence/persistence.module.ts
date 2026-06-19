import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CATEGORY_REPOSITORY } from '../../domain/categories/category.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/products/product.repository.port';
import { SAVED_SEARCH_REPOSITORY } from '../../domain/saved-searches/saved-search.repository.port';
import { ProductAttributeEntity } from '../../database/entities/product-attribute.entity';
import { RedisModule } from '../redis/redis.module';
import { SearchModule } from '../search/search.module';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { SavedSearchRepository } from './repositories/saved-search.repository';
import { CachedProductRepository } from '../redis/repositories/cached-product.repository';
import { CachedCategoryRepository } from '../redis/repositories/cached-category.repository';
import { CachedSavedSearchRepository } from '../redis/repositories/cached-saved-search.repository';
import {
  createCategoryRepositoryProvider,
  createProductRepositoryProvider,
  createSavedSearchRepositoryProvider,
} from '../search/search.providers';

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
    createProductRepositoryProvider(),
    createCategoryRepositoryProvider(),
    createSavedSearchRepositoryProvider(),
  ],
  exports: [
    PRODUCT_REPOSITORY,
    CATEGORY_REPOSITORY,
    SAVED_SEARCH_REPOSITORY,
    SearchModule,
  ],
})
export class PersistenceModule {}
