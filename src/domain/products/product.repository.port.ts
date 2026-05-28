import type { Product, ProductListItem, QuickViewProduct } from './product.model';
import type { CreateProductInput, UpdateProductInput } from './product-write.model';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  findById(id: number): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findQuickView(id: number): Promise<QuickViewProduct | null>;
  findRelated(productId: number, limit: number): Promise<ProductListItem[]>;
  existsBySku(sku: string, excludeId?: number): Promise<boolean>;
  existsBySlug(slug: string, excludeId?: number): Promise<boolean>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: number, input: UpdateProductInput): Promise<Product | null>;
}
