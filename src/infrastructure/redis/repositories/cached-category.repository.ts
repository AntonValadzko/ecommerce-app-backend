import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ICategoryRepository } from '../../../domain/categories/category.repository.port';
import type { Category, CategoryTreeNode } from '../../../domain/categories/category.model';
import { CategoryRepository } from '../../persistence/repositories/category.repository';
import { RedisCacheService } from '../redis-cache.service';
import type { RedisConfig } from '../redis.types';

@Injectable()
export class CachedCategoryRepository implements ICategoryRepository {
  private readonly ttl: RedisConfig['cacheTtl'];

  constructor(
    private readonly inner: CategoryRepository,
    private readonly cache: RedisCacheService,
    configService: ConfigService,
  ) {
    this.ttl = configService.get<RedisConfig>('redis')!.cacheTtl;
  }

  findAll(): Promise<Category[]> {
    return this.cache.wrap(this.cache.versionedKey(['categories', 'all']), this.ttl.categories, () =>
      this.inner.findAll(),
    );
  }

  findById(id: number): Promise<Category | null> {
    return this.inner.findById(id);
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.cache.wrap(this.cache.versionedKey(['categories', 'slug', slug]), this.ttl.categorySlug, () =>
      this.inner.findBySlug(slug),
    );
  }

  getTree(): Promise<CategoryTreeNode[]> {
    return this.cache.wrap(this.cache.versionedKey(['categories', 'tree']), this.ttl.categories, () =>
      this.inner.getTree(),
    );
  }
}
