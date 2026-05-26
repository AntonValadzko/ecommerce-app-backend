import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import { SavedSearchEntity } from './entities/saved-search.entity';
import { PostgresInitial1700000000000 } from './migrations/1700000000000-PostgresInitial';

export const DATABASE_ENTITIES = [
  CategoryEntity,
  ProductEntity,
  ProductAttributeEntity,
  SavedSearchEntity,
];

export const DATABASE_MIGRATIONS = [PostgresInitial1700000000000];
