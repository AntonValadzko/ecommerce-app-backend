import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  PaginatedResult,
  Product,
  ProductListItem,
  ProductQuery,
  SortOption,
} from '../../../domain/products/product.model';
import type { ProductSeoMeta } from './product-response.types';

@Injectable()
export class ProductsPresenter {
  readonly pageSizeOptions: number[];

  constructor(configService: ConfigService) {
    this.pageSizeOptions = configService.get<number[]>('allowedPageSizes') ?? [24, 48, 96];
  }

  toListResponse(
    result: PaginatedResult<ProductListItem>,
    query: ProductQuery,
    sort: SortOption | undefined,
    useCursor: boolean,
    baseUrl: string,
  ) {
    return {
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      },
      meta: {
        sort,
        pageSizeOptions: this.pageSizeOptions,
        infiniteScroll: useCursor,
        seo: this.buildListingSeo(query, result.total, baseUrl),
      },
    };
  }

  toDetailResponse(product: Product, baseUrl: string) {
    return {
      data: product,
      meta: { seo: this.buildProductSeo(product, baseUrl) },
    };
  }

  toDataResponse<T>(data: T) {
    return { data };
  }

  private buildProductSeo(product: Product, baseUrl: string): ProductSeoMeta {
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

  private buildListingSeo(query: ProductQuery, total: number, baseUrl: string): ProductSeoMeta {
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
}
