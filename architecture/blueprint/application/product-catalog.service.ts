/**
 * Blueprint — write use cases with explicit orchestration.
 *
 * Reads stay in ProductsService; writes + side effects live here.
 * This removes hidden behavior from CachedProductRepository.
 */
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_INVALIDATOR, type ICacheInvalidator } from '../ports/cache-invalidator.port';
import {
  PRODUCT_INDEX_SYNC,
  type IProductIndexSync,
} from '../ports/product-index-sync.port';

// In real code: import from core/domain
type Product = { id: number /* ... */ };
type CreateProductInput = { name: string /* ... */ };
type UpdateProductInput = Partial<CreateProductInput>;

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  create(input: CreateProductInput): Promise<Product>;
  update(id: number, input: UpdateProductInput): Promise<Product | null>;
}

@Injectable()
export class ProductCatalogService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(CACHE_INVALIDATOR) private readonly cache: ICacheInvalidator,
    @Inject(PRODUCT_INDEX_SYNC) private readonly indexSync: IProductIndexSync,
  ) {}

  async createProduct(input: CreateProductInput): Promise<Product> {
    const product = await this.products.create(input);
    await this.afterWrite(product.id);
    return product;
  }

  async updateProduct(id: number, input: UpdateProductInput): Promise<Product | null> {
    const product = await this.products.update(id, input);
    if (product) await this.afterWrite(id);
    return product;
  }

  private async afterWrite(productId: number): Promise<void> {
    await this.cache.onCatalogMutation();
    await this.indexSync.afterProductChange(productId);
  }
}
