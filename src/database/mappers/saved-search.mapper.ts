import { SavedSearchEntity } from '../entities/saved-search.entity';
import type { SavedSearch } from '../../domain/saved-searches/saved-search.model';
import type { ProductQuery } from '../../domain/products/product.model';

export function toSavedSearch(entity: SavedSearchEntity): SavedSearch {
  return {
    id: entity.id,
    sessionId: entity.sessionId,
    name: entity.name,
    query: entity.queryJson as ProductQuery,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function toSavedSearchEntity(data: {
  id: string;
  sessionId: string;
  name: string;
  query: ProductQuery;
  createdAt: Date;
  updatedAt: Date;
}): SavedSearchEntity {
  const entity = new SavedSearchEntity();
  entity.id = data.id;
  entity.sessionId = data.sessionId;
  entity.name = data.name;
  entity.queryJson = data.query as Record<string, unknown>;
  entity.createdAt = data.createdAt;
  entity.updatedAt = data.updatedAt;
  return entity;
}
