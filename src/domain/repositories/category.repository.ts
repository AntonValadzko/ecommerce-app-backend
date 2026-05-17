import type { Category, CategoryTreeNode } from '../entities/category.js';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: number): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  getTree(): Promise<CategoryTreeNode[]>;
}
