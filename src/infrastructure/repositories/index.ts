import { getDatabase } from '../database/connection.js';
import { SqliteProductRepository } from './sqlite-product.repository.js';
import { SqliteCategoryRepository } from './sqlite-category.repository.js';
import { SqliteSavedSearchRepository } from './sqlite-saved-search.repository.js';

export function createRepositories() {
  const db = getDatabase();
  return {
    products: new SqliteProductRepository(db),
    categories: new SqliteCategoryRepository(db),
    savedSearches: new SqliteSavedSearchRepository(db),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;
