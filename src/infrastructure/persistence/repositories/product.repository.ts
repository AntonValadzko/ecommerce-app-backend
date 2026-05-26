import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ProductEntity } from '../../../database/entities/product.entity';
import { toProduct, toProductListItem, toQuickViewProduct } from '../../../database/mappers/product.mapper';
import type { IProductRepository } from '../../../domain/products/product.repository.port';
import type { Product, ProductListItem, QuickViewProduct } from '../../../domain/products/product.model';

const PRODUCT_RELATIONS = ['category', 'attributes'] as const;

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async findById(id: number): Promise<Product | null> {
    const entity = await this.productRepo.findOne({
      where: { id },
      relations: [...PRODUCT_RELATIONS],
    });
    return entity ? toProduct(entity) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const entity = await this.productRepo.findOne({
      where: { slug },
      relations: [...PRODUCT_RELATIONS],
    });
    return entity ? toProduct(entity) : null;
  }

  async findQuickView(id: number): Promise<QuickViewProduct | null> {
    const entity = await this.productRepo.findOne({
      where: { id },
      relations: ['attributes'],
    });
    return entity ? toQuickViewProduct(entity) : null;
  }

  async findRelated(productId: number, limit: number): Promise<ProductListItem[]> {
    const source = await this.productRepo.findOne({
      where: { id: productId },
      select: ['id', 'categoryId'],
    });
    if (!source) return [];

    const entities = await this.productRepo.find({
      where: { categoryId: source.categoryId, id: Not(productId) },
      relations: ['category'],
      order: { popularityScore: 'DESC', id: 'DESC' },
      take: limit,
    });

    return entities.map(toProductListItem);
  }
}
