import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ProductEntity } from '../../../database/entities/product.entity';
import { toProduct, toProductListItem, toQuickViewProduct } from '../../../database/mappers/product.mapper';
import type { IProductRepository } from '../../../domain/products/product.repository.port';
import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  Product,
  ProductListItem,
  ProductQuery,
  QuickViewProduct,
} from '../../../domain/products/product.model';
import { ProductSearchRepository } from './product-search.repository';

const PRODUCT_RELATIONS = ['category', 'attributes'] as const;

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    private readonly productSearch: ProductSearchRepository,
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

  async findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>> {
    return this.productSearch.findMany(query);
  }

  async getFacets(query: ProductQuery): Promise<FilterFacets> {
    return this.productSearch.getFacets(query);
  }

  async autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]> {
    return this.productSearch.autocomplete(term, limit);
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
