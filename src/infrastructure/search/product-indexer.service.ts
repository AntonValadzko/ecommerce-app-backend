import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';
import type { IProductIndexer } from '../../domain/products/product-index.port';
import { ProductEntity } from '../../database/entities/product.entity';
import { OpenSearchClientProvider } from './opensearch.client';
import type { ProductIndexDocument } from './product-index.document';

@Injectable()
export class ProductIndexerService implements IProductIndexer {
  private readonly logger = new Logger(ProductIndexerService.name);

  constructor(
    private readonly os: OpenSearchClientProvider,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async reindexAll(batchSize = 500): Promise<number> {
    const total = await this.productRepo.count();
    let indexed = 0;
    let offset = 0;

    while (offset < total) {
      const products = await this.productRepo.find({
        relations: ['category', 'attributes'],
        order: { id: 'ASC' },
        skip: offset,
        take: batchSize,
      });

      if (!products.length) break;

      const body = products.flatMap((p) => {
        const doc = this.toIndexDocument(p);
        return [{ index: { _index: this.os.index, _id: String(p.id) } }, doc];
      });

      const result = await this.os.requireClient().bulk({ refresh: true, body });
      if (result.body.errors) {
        this.logger.error('Bulk index errors', JSON.stringify(result.body.items?.slice(0, 3)));
        throw new Error('OpenSearch bulk indexing failed');
      }

      indexed += products.length;
      offset += batchSize;
      this.logger.log(`Indexed ${indexed}/${total} products`);
    }

    return indexed;
  }

  async indexProduct(productId: number): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['category', 'attributes'],
    });
    if (!product) throw new EntityNotFoundError('Product', productId);

    await this.os.requireClient().index({
      index: this.os.index,
      id: String(productId),
      body: this.toIndexDocument(product),
      refresh: true,
    });
    this.logger.debug(`Indexed product ${productId}`);
  }

  toIndexDocument(entity: ProductEntity): ProductIndexDocument {
    return {
      id: entity.id,
      sku: entity.sku,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      brand: entity.brand,
      categoryId: entity.categoryId,
      categoryName: entity.category?.name ?? '',
      categorySlug: entity.category?.slug ?? '',
      price: Number(entity.price),
      compareAtPrice: entity.compareAtPrice != null ? Number(entity.compareAtPrice) : null,
      currency: entity.currency,
      rating: Number(entity.rating),
      reviewCount: entity.reviewCount,
      inStock: entity.inStock,
      imageUrl: entity.imageUrl,
      popularityScore: entity.popularityScore,
      createdAt:
        entity.createdAt instanceof Date ? entity.createdAt.toISOString() : String(entity.createdAt),
      attributes: (entity.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
    };
  }
}
