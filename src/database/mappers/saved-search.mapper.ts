import { SavedSearchEntity } from '../entities/saved-search.entity';
import type { SavedSearch } from '../../domain/saved-searches/saved-search.model';
import type { ProductQuery } from '../../domain/products/product.model';

export function toSavedSearch(entity: SavedSearchEntity): SavedSearch {
  return {
    id: entity.id,
    sessionId: entity.sessionId,
    name: entity.name,
    query: JSON.parse(entity.queryJson) as ProductQuery,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function toSavedSearchEntity(data: {
  id: string;
  sessionId: string;
  name: string;
  query: ProductQuery;
  createdAt: string;
  updatedAt: string;
}): SavedSearchEntity {
  const entity = new SavedSearchEntity();
  entity.id = data.id;
  entity.sessionId = data.sessionId;
  entity.name = data.name;
  entity.queryJson = JSON.stringify(data.query);
  entity.createdAt = data.createdAt;
  entity.updatedAt = data.updatedAt;
  return entity;
}
