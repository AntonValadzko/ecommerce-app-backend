/**
 * Blueprint — adapter implementing IProductIndexSync using queue + fallback.
 */
import { Inject, Injectable } from '@nestjs/common';
import type { IProductIndexSync } from '../../ports/product-index-sync.port';

@Injectable()
export class ProductIndexSyncAdapter implements IProductIndexSync {
  constructor(
    @Inject('ProductIndexQueueService') private readonly queue: {
      enqueueOrIndex(id: number): Promise<void>;
    },
  ) {}

  afterProductChange(productId: number): Promise<void> {
    return this.queue.enqueueOrIndex(productId);
  }
}
