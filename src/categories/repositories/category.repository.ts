import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type Database from 'better-sqlite3';
import type { Category, CategoryTreeNode } from '../category.types';

interface CategoryRow {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  description: string | null;
  product_count?: number;
}

@Injectable()
export class CategoryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private get db(): Database.Database {
    return (this.dataSource.driver as unknown as { databaseConnection: Database.Database })
      .databaseConnection;
  }

  async findAll(): Promise<Category[]> {
    const rows = this.db
      .prepare(
        `SELECT c.*, COUNT(p.id) as product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
         GROUP BY c.id
         ORDER BY c.name`,
      )
      .all() as CategoryRow[];

    return rows.map((r) => this.mapRow(r));
  }

  async findById(id: number): Promise<Category | null> {
    const row = this.db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(id) as CategoryRow | undefined;
    return row ? this.mapRow(row) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const row = this.db
      .prepare('SELECT * FROM categories WHERE slug = ?')
      .get(slug) as CategoryRow | undefined;
    return row ? this.mapRow(row) : null;
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

  private mapRow(row: CategoryRow): Category {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      parentId: row.parent_id,
      description: row.description,
      productCount: row.product_count,
    };
  }
}
