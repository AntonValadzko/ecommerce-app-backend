import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './repositories/category.repository';
import type { Category, CategoryTreeNode } from './category.types';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async getAll(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    return this.categoryRepo.getTree();
  }

  async getBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }
    return category;
  }
}
