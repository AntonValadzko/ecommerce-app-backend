import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductRepository } from './repositories/product.repository';
import type {
  Product,
  ProductListItem,
  ProductQuery,
  PaginatedResult,
  AutocompleteSuggestion,
  FilterFacets,
  QuickViewProduct,
  ProductSeoMeta,
} from './product.types';

@Injectable()
export class ProductsService {
  private readonly defaultPageSize: number;
  private readonly allowedPageSizes: number[];
  private readonly maxPageSize: number;
  private readonly autocompleteLimit: number;
  private readonly relatedProductsLimit: number;

  constructor(
    private readonly productRepo: ProductRepository,
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
    if (!product) throw new NotFoundException(`Product "${id}" not found`);
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) throw new NotFoundException(`Product "${slug}" not found`);
    return product;
  }

  async getQuickView(id: number): Promise<QuickViewProduct> {
    const product = await this.productRepo.findQuickView(id);
    if (!product) throw new NotFoundException(`Product "${id}" not found`);
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

  buildProductSeo(product: Product, baseUrl: string): ProductSeoMeta {
    const canonicalUrl = `${baseUrl}/products/${product.slug}`;
    const availability = product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    return {
      title: `${product.name} | ${product.brand}`,
      description: product.description.slice(0, 160),
      canonicalUrl,
      ogType: 'product',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.sku,
        brand: { '@type': 'Brand', name: product.brand },
        image: product.imageUrl,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability,
          url: canonicalUrl,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        },
      },
    };
  }

  buildListingSeo(query: ProductQuery, total: number, baseUrl: string): ProductSeoMeta {
    const parts: string[] = [];
    if (query.search) parts.push(`"${query.search}"`);
    if (query.categorySlug) parts.push(query.categorySlug);
    const title = parts.length
      ? `Search: ${parts.join(' · ')} (${total} results)`
      : `Product Catalog (${total} products)`;

    return {
      title,
      description: `Browse ${total} products with advanced filters and sorting.`,
      canonicalUrl: `${baseUrl}/products`,
      ogType: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        numberOfItems: total,
      },
    };
  }

  private normalizeLimit(limit?: number): number {
    if (!limit) return this.defaultPageSize;
    if (this.allowedPageSizes.includes(limit)) return limit;
    return Math.min(limit, this.maxPageSize);
  }
}
