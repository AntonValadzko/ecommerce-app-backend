import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IProductRepository } from '../../../domain/products/product.repository.port';
import type { Product, ProductListItem, QuickViewProduct } from '../../../domain/products/product.model';
import type { CreateProductInput, UpdateProductInput } from '../../../domain/products/product-write.model';
import { ProductRepository } from '../../persistence/repositories/product.repository';
import { CacheInvalidationService } from '../cache-invalidation.service';
import { ProductIndexQueueService } from '../../search/product-index-queue.service';
import { RedisCacheService } from '../redis-cache.service';
import type { RedisConfig } from '../redis.types';

@Injectable()
export class CachedProductRepository implements IProductRepository {
  private readonly ttl: RedisConfig['cacheTtl'];

  constructor(
    private readonly inner: ProductRepository,
    private readonly cache: RedisCacheService,
    private readonly cacheInvalidation: CacheInvalidationService,
    private readonly indexQueue: ProductIndexQueueService,
    configService: ConfigService,
  ) {
    this.ttl = configService.get<RedisConfig>('redis')!.cacheTtl;
  }

  findById(id: number): Promise<Product | null> {
    return this.cache.wrap(this.cache.versionedKey(['product', 'id', String(id)]), this.ttl.product, () =>
      this.inner.findById(id),
    );
  }

  findBySlug(slug: string): Promise<Product | null> {
    return this.cache.wrap(this.cache.versionedKey(['product', 'slug', slug]), this.ttl.product, () =>
      this.inner.findBySlug(slug),
    );
  }

  findQuickView(id: number): Promise<QuickViewProduct | null> {
    return this.cache.wrap(this.cache.versionedKey(['quick-view', String(id)]), this.ttl.product, () =>
      this.inner.findQuickView(id),
    );
  }

  findRelated(productId: number, limit: number): Promise<ProductListItem[]> {
    return this.cache.wrap(
      this.cache.versionedKey(['related', String(productId), String(limit)]),
      this.ttl.productRelated,
      () => this.inner.findRelated(productId, limit),
    );
  }

  existsBySku(sku: string, excludeId?: number): Promise<boolean> {
    return this.inner.existsBySku(sku, excludeId);
  }

  existsBySlug(slug: string, excludeId?: number): Promise<boolean> {
    return this.inner.existsBySlug(slug, excludeId);
  }

  async create(input: CreateProductInput): Promise<Product> {
    const product = await this.inner.create(input);
    await this.afterCatalogWrite(product.id);
    return product;
  }

  async update(id: number, input: UpdateProductInput): Promise<Product | null> {
    const product = await this.inner.update(id, input);
    if (product) {
      await this.afterCatalogWrite(id);
    }
    return product;
  }

  private async afterCatalogWrite(productId: number): Promise<void> {
    await this.cacheInvalidation.onCatalogMutation();
    await this.indexQueue.enqueueOrIndex(productId);
  }
}
