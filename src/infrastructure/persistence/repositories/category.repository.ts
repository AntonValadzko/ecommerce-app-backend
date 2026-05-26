import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../../database/entities/category.entity';
import { toCategory } from '../../../database/mappers/category.mapper';
import type { ICategoryRepository } from '../../../domain/categories/category.repository.port';
import type { Category, CategoryTreeNode } from '../../../domain/categories/category.model';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  async findAll(): Promise<Category[]> {
    const entities = await this.categoryRepo
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .orderBy('category.name', 'ASC')
      .getMany();

    return entities.map(toCategory);
  }

  async findById(id: number): Promise<Category | null> {
    const entity = await this.categoryRepo.findOneBy({ id });
    return entity ? toCategory(entity) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const entity = await this.categoryRepo.findOneBy({ slug });
    return entity ? toCategory(entity) : null;
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.findAll();
    const map = new Map<number, CategoryTreeNode>();

    for (const cat of categories) {
      map.set(cat.id, { ...cat, children: [] });
    }

    const roots: CategoryTreeNode[] = [];
    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
