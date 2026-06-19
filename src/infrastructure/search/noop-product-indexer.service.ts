import { Injectable } from '@nestjs/common';
import type { IProductIndexer } from '../../domain/products/product-index.port';

@Injectable()
export class NoOpProductIndexer implements IProductIndexer {
  async indexProduct(_productId: number): Promise<void> {
    /* OpenSearch disabled */
  }
}
