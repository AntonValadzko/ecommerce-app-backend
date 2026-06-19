/**
 * Blueprint — read-only cache decorator (no create/update, no index queue).
 *
 * Write path goes through ProductCatalogService instead.
 */
import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../application/product-catalog.service';

@Injectable()
export class CachedProductRepository implements Pick<
  IProductRepository,
  never // read methods only in full impl
> {
  constructor(
    @Inject('ProductRepository') private readonly inner: IProductRepository,
    @Inject('RedisCacheService') private readonly cache: { wrap: Function },
  ) {}

  // Example read method — create/update intentionally omitted
  async findById(id: number): Promise<unknown> {
    return this.cache.wrap(`product:id:${id}`, 300, () => this.inner.findById?.(id));
  }
}
