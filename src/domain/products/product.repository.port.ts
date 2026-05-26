import type { Product, ProductListItem, QuickViewProduct } from './product.model';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  findById(id: number): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findQuickView(id: number): Promise<QuickViewProduct | null>;
  findRelated(productId: number, limit: number): Promise<ProductListItem[]>;
}
