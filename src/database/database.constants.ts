import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import { SavedSearchEntity } from './entities/saved-search.entity';
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema';
import { Fts51700000000001 } from './migrations/1700000000001-Fts5';

export const DATABASE_ENTITIES = [
  CategoryEntity,
  ProductEntity,
  ProductAttributeEntity,
  SavedSearchEntity,
];

export const DATABASE_MIGRATIONS = [InitialSchema1700000000000, Fts51700000000001];
