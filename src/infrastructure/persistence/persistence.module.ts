import { Global, Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/products/product.repository.port';
import { CATEGORY_REPOSITORY } from '../../domain/categories/category.repository.port';
import { SAVED_SEARCH_REPOSITORY } from '../../domain/saved-searches/saved-search.repository.port';
import { SearchModule } from '../search/search.module';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { SavedSearchRepository } from './repositories/saved-search.repository';

@Global()
@Module({
  imports: [SearchModule],
  providers: [
    ProductRepository,
    CategoryRepository,
    SavedSearchRepository,
    { provide: PRODUCT_REPOSITORY, useExisting: ProductRepository },
    { provide: CATEGORY_REPOSITORY, useExisting: CategoryRepository },
    { provide: SAVED_SEARCH_REPOSITORY, useExisting: SavedSearchRepository },
  ],
  exports: [PRODUCT_REPOSITORY, CATEGORY_REPOSITORY, SAVED_SEARCH_REPOSITORY, SearchModule],
})
export class PersistenceModule {}
