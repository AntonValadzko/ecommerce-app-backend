import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { slugify } from '../../common/utils/slugify';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';
import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from '../../domain/categories/category.repository.port';
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from '../../domain/products/product.repository.port';
import {
  PRODUCT_SEARCH_REPOSITORY,
  type IProductSearchRepository,
} from '../../domain/products/product-search.repository.port';
import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  Product,
  ProductListItem,
  ProductQuery,
  QuickViewProduct,
} from '../../domain/products/product.model';
import type {
  CreateProductCommand,
  CreateProductInput,
  UpdateProductInput,
} from '../../domain/products/product-write.model';

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
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearch: IProductSearchRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
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
    return this.productSearch.findMany({ ...query, limit });
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
    return this.productSearch.autocomplete(term, limit ?? this.autocompleteLimit);
  }

  async getFacets(query: ProductQuery): Promise<FilterFacets> {
    return this.productSearch.getFacets(query);
  }

  async getRelatedProducts(productId: number): Promise<ProductListItem[]> {
    return this.productRepo.findRelated(productId, this.relatedProductsLimit);
  }

  async createProduct(command: CreateProductCommand): Promise<Product> {
    await this.assertCategoryExists(command.categoryId);

    if (await this.productRepo.existsBySku(command.sku)) {
      throw new ConflictException(`Product with SKU "${command.sku}" already exists`);
    }

    const slug = await this.resolveUniqueSlug(command.slug?.trim() || command.name);
    const input: CreateProductInput = { ...command, slug };
    return this.productRepo.create(input);
  }

  async updateProduct(id: number, input: UpdateProductInput): Promise<Product> {
    const existing = await this.productRepo.findById(id);
    if (!existing) throw new EntityNotFoundError('Product', id);
    if (Object.keys(input).length === 0) {
      return existing;
    }

    if (input.categoryId !== undefined) {
      await this.assertCategoryExists(input.categoryId);
    }

    if (input.sku !== undefined && (await this.productRepo.existsBySku(input.sku, id))) {
      throw new ConflictException(`Product with SKU "${input.sku}" already exists`);
    }

    if (input.slug !== undefined) {
      const slug = slugify(input.slug);
      if (!slug) {
        throw new ConflictException('Slug cannot be empty');
      }
      input.slug = slug;
      if (await this.productRepo.existsBySlug(slug, id)) {
        throw new ConflictException(`Product with slug "${slug}" already exists`);
      }
    }

    const product = await this.productRepo.update(id, input);
    if (!product) throw new EntityNotFoundError('Product', id);
    return product;
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) throw new EntityNotFoundError('Category', categoryId);
  }

  private async resolveUniqueSlug(base: string, excludeId?: number): Promise<string> {
    const root = slugify(base);
    if (!root) {
      throw new ConflictException('Cannot generate slug from empty name');
    }

    let candidate = root;
    let suffix = 2;
    while (await this.productRepo.existsBySlug(candidate, excludeId)) {
      candidate = `${root}-${suffix}`;
      suffix++;
    }
    return candidate;
  }

  private normalizeLimit(limit?: number): number {
    if (!limit) return this.defaultPageSize;
    if (this.allowedPageSizes.includes(limit)) return limit;
    return Math.min(limit, this.maxPageSize);
  }
}
