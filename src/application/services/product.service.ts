import type { Repositories } from '../../infrastructure/repositories/index.js';
import type {
  PaginatedResult,
  Product,
  ProductListItem,
  ProductQuery,
} from '../../domain/entities/product.js';
import type {
  AutocompleteSuggestion,
  FilterFacets,
} from '../../domain/repositories/product.repository.js';
import { config } from '../../config/index.js';

export interface ProductSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: string;
  structuredData: Record<string, unknown>;
}

export interface QuickViewProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  imageUrl: string;
  attributes: { name: string; value: string }[];
}

export class ProductService {
  constructor(private readonly repos: Repositories) {}

  async listProducts(query: ProductQuery): Promise<PaginatedResult<ProductListItem>> {
    const limit = this.normalizeLimit(query.limit);
    return this.repos.products.findMany({ ...query, limit });
  }

  async getProduct(id: number): Promise<Product | null> {
    return this.repos.products.findById(id);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.repos.products.findBySlug(slug);
  }

  async getQuickView(id: number): Promise<QuickViewProduct | null> {
    const product = await this.repos.products.findById(id);
    if (!product) return null;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: product.currency,
      rating: product.rating,
      reviewCount: product.reviewCount,
      inStock: product.inStock,
      imageUrl: product.imageUrl,
      attributes: product.attributes,
    };
  }

  async autocomplete(term: string): Promise<AutocompleteSuggestion[]> {
    return this.repos.products.autocomplete(term, config.autocompleteLimit);
  }

  async getFacets(query: ProductQuery): Promise<FilterFacets> {
    return this.repos.products.getFacets(query);
  }

  async getRelatedProducts(productId: number): Promise<ProductListItem[]> {
    return this.repos.products.findRelated(productId, config.relatedProductsLimit);
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
    if (!limit) return config.defaultPageSize;
    if ((config.allowedPageSizes as readonly number[]).includes(limit)) {
      return limit;
    }
    return Math.min(limit, config.maxPageSize);
  }
}
