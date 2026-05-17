import type { Repositories } from '../../infrastructure/repositories/index.js';
import type { Category, CategoryTreeNode } from '../../domain/entities/category.js';

export class CategoryService {
  constructor(private readonly repos: Repositories) {}

  async getAll(): Promise<Category[]> {
    return this.repos.categories.findAll();
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    return this.repos.categories.getTree();
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return this.repos.categories.findBySlug(slug);
  }
}
