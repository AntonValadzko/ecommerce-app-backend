import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from '../../domain/products/product.repository.port';
import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  Product,
  ProductListItem,
  ProductQuery,
  QuickViewProduct,
} from '../../domain/products/product.model';

@Injectable()
export class ProductsService {
  private readonly defaultPageSize: number;
  private readonly allowedPageSizes: number[];
  private readonly maxPageSize: number;
  private readonly autocompleteLimit: number;
  private readonly relatedProductsLimit: number;

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
    configService: ConfigService,
  ) {
    this.defaultPageSize = configService.get<number>('defaultPageSize') ?? 24;
    this.allowedPageSizes = configService.get<number[]>('allowedPageSizes') ?? [24, 48, 96];
    this.maxPageSize = configService.get<number>('maxPageSize') ?? 96;
    this.autocompleteLimit = configService.get<number>('autocompleteLimit') ?? 10;
    this.relatedProductsLimit = configService.get<number>('relatedProductsLimit') ?? 6;
  }

  async listProducts(query: ProductQuery): Promise<PaginatedResult<ProductListItem>> {
    const limit = this.normalizeLimit(query.limit);
    return this.productRepo.findMany({ ...query, limit });
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product) throw new EntityNotFoundError('Product', id);
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) throw new EntityNotFoundError('Product', slug);
    return product;
  }

  async getQuickView(id: number): Promise<QuickViewProduct> {
    const product = await this.productRepo.findQuickView(id);
    if (!product) throw new EntityNotFoundError('Product', id);
    return product;
  }

  async autocomplete(term: string, limit?: number): Promise<AutocompleteSuggestion[]> {
    return this.productRepo.autocomplete(term, limit ?? this.autocompleteLimit);
  }

  async getFacets(query: ProductQuery): Promise<FilterFacets> {
    return this.productRepo.getFacets(query);
  }

  async getRelatedProducts(productId: number): Promise<ProductListItem[]> {
    return this.productRepo.findRelated(productId, this.relatedProductsLimit);
  }

  private normalizeLimit(limit?: number): number {
    if (!limit) return this.defaultPageSize;
    if (this.allowedPageSizes.includes(limit)) return limit;
    return Math.min(limit, this.maxPageSize);
  }
}
