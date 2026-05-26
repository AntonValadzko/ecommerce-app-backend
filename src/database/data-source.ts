import 'reflect-metadata';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import { SavedSearchEntity } from './entities/saved-search.entity';
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema';
import { Fts51700000000001 } from './migrations/1700000000001-Fts5';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'catalog.db'),
  entities: [CategoryEntity, ProductEntity, ProductAttributeEntity, SavedSearchEntity],
  migrations: [InitialSchema1700000000000, Fts51700000000001],
  synchronize: false,
});
