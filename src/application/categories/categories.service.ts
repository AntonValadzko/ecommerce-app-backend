import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';
import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from '../../domain/categories/category.repository.port';
import type { Category, CategoryTreeNode } from '../../domain/categories/category.model';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
  ) {}

  async getAll(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    return this.categoryRepo.getTree();
  }

  async getBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findBySlug(slug);
    if (!category) throw new EntityNotFoundError('Category', slug);
    return category;
  }
}
