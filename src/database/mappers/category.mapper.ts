import { CategoryEntity } from '../entities/category.entity';
import type { Category } from '../../domain/categories/category.model';

export function toCategory(entity: CategoryEntity): Category {
  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.name,
    parentId: entity.parentId,
    description: entity.description,
    productCount: entity.productCount,
  };
}
